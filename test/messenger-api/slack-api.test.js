const logger = require('../../src/modules/log')('slack-api');
const faker = require('faker');
const {WebClient} = require('@slack/client');
const EventEmitter = require('events');

const messages = require('../fixtures/events/slack/messages.json');
const conversationRenameJSON = require('../fixtures/slack-requests/conversations/rename.json');
const conversationPurposeJSON = require('../fixtures/slack-requests/conversations/setPurpose.json');
const conversationMembersJSON = require('../fixtures/slack-requests/conversations/mamebers.json');
const conversationsInviteJSON = require('../fixtures/slack-requests/conversations/invite.json');
const usersConversationsJSON = require('../fixtures/slack-requests/users/conversations.json');
const postMessageJSON = require('../fixtures/slack-requests/chat/post-message.json');
const userJSON = require('../fixtures/slack-requests/user.json');
const testJSON = require('../fixtures/slack-requests/auth-test.json');
const conversationJSON = require('../fixtures/slack-requests/conversation.json');
const SlackApi = require('../../src/messengers/slack-api');

const chai = require('chai');
const {stub, createStubInstance} = require('sinon');
const sinonChai = require('sinon-chai');
const {expect} = chai;
chai.use(sinonChai);

const testConfig = {
    name: 'slack',
    admins: ['test_user'],
    user: 'jirabot',
    domain: faker.internet.domainName(),
    password: faker.random.uuid(),
    eventPassword: faker.internet.password(22),
    eventPort: 3000,
};

const testTopic = 'My topic';
const trueUserMail = 'user@example.com';
const correctSlackUserId = userJSON.correct.user.id;
const options = {
    name: 'MY_ROOM',
    topic: testTopic,
    invite: ['user@example.com', 'user1@example.com'],
    purpose: conversationPurposeJSON.correct.purpose,
};

describe('Slack api testing', () => {
    const auth = {
        test: stub().resolves(testJSON.user),
    };
    const conversations = {
        // https://api.slack.com/methods/conversations.create
        create: stub().resolves(conversationJSON.correct),
        // https://api.slack.com/methods/conversations.setTopic
        setTopic: stub().resolves({ok: true, topic: testTopic}),
        // https://api.slack.com/methods/conversations.invite
        invite: stub().resolves(conversationsInviteJSON.correct),
        // https://api.slack.com/methods/conversations.members
        members: stub().resolves(conversationMembersJSON.correct),
        // https://api.slack.com/methods/conversations.setPurpose
        setPurpose: stub().resolves(conversationPurposeJSON.correct),
        // https://api.slack.com/methods/conversations.rename
        rename: stub().resolves(conversationRenameJSON.correct),
    };
    const users = {
        // https://api.slack.com/methods/users.lookupByEmail
        lookupByEmail: stub().resolves(userJSON.correct),
        // https://api.slack.com/methods/users.conversations
        conversations: stub().resolves(usersConversationsJSON.correct),
    };
    const chat = {
        // https://api.slack.com/methods/chat.postMessage
        postMessage: stub().resolves(postMessageJSON.correct),
    };

    const slackSdkClient = {...createStubInstance(WebClient), auth, conversations, users, chat};

    const slackEventListener = {
        ...createStubInstance(EventEmitter),
        start: stub().resolves(),
        stop: stub(),
    };

    const eventApi = stub()
        .withArgs(testConfig.eventPassword)
        .returns(slackEventListener);

    const commands = {
        comment: stub(),
        assign: stub(),
        move: stub(),
        spec: stub(),
        prio: stub(),
        op: stub(),
        invite: stub(),
        help: stub(),
    };

    const slackApi = new SlackApi({config: testConfig, slackSdkClient, commands, eventApi, logger});
    beforeEach(async () => {
        await slackApi.connect();
    });

    afterEach(() => {
        slackApi.disconnect();
        Object.values(commands).map(com => com.resetHistory());
    });

    it('Expect api connect works correct', () => {
        const res = slackApi.isConnected();
        expect(res).to.be.true;
    });

    it('Expect create room run setTopic, setPurpose and create conversaton with correct data', async () => {
        await slackApi.connect();
        const roomId = await slackApi.createRoom(options);

        expect(roomId).to.be.eq(conversationJSON.correct.channel.id);
        expect(slackSdkClient.conversations.create).to.be.calledWithExactly({
            'token': testConfig.password,
            'is_private': true,
            'name': options.name.toLowerCase(),
            'user_ids': [userJSON.correct.user.id, userJSON.correct.user.id],
        });
        expect(slackSdkClient.conversations.setPurpose).to.be.calledWithExactly({
            token: testConfig.password,
            channel: roomId,
            purpose: options.purpose,
        });
    });

    it('Expect send message work correct', async () => {
        const text = 'message';
        const attachments = 'message';
        const channel = conversationJSON.correct.channel.id;

        await slackApi.sendHtmlMessage(channel, attachments, text);

        const expectedData = {
            token: testConfig.password,
            channel,
            text,
        };
        expect(slackSdkClient.chat.postMessage).to.be.calledWithExactly(expectedData);
    });

    it('Expect getRoomId returns correct id if it exists', async () => {
        const [channel] = usersConversationsJSON.correct.channels;
        const roomId = await slackApi.getRoomId(channel.name);

        expect(roomId).to.be.eq(channel.id);
    });

    it('Expect getRoomId throws error if id is not exists', async () => {
        let err;
        try {
            await slackApi.getRoomId(faker.name.firstName());
        } catch (error) {
            err = error;
        }
        expect(err).not.to.be.undefined;
    });

    it('Expect getRoomId returns correct id if it exists and put to method in upperCase', async () => {
        const [channel] = usersConversationsJSON.correct.channels;
        const roomId = await slackApi.getRoomId(channel.name.toUpperCase());

        expect(roomId).to.be.eq(channel.id);
    });

    it('Expect invite room returns true if user invited', async () => {
        const channel = conversationsInviteJSON.correct.channel.id;
        const res = await slackApi.invite(channel, trueUserMail);

        expect(res).to.be.true;
        const expectedData = {
            token: testConfig.password,
            channel,
            users: correctSlackUserId,
        };
        expect(conversations.invite).to.be.calledWithExactly(expectedData);
    });

    it('Expect getJoinedMembers return array of members', async () => {
        const [channel] = usersConversationsJSON.correct.channels;
        const members = await slackApi.getRoomMembers(channel.name);

        expect(members).to.be.an('array');
    });

    it('Expect setRoomName works well array of members', async () => {
        const {name} = conversationRenameJSON.correct.channel;
        const status = await slackApi.setRoomName(conversationJSON.correct.channel.id, name);

        expect(status).to.be.true;
        expect(conversations.rename).to.be.calledWithExactly({
            token: testConfig.password,
            channel: conversationJSON.correct.channel.id,
            name,
        });
    });

    it('Expect slack api handle correct and not call command if body is simple message "123"', async () => {
        await slackApi.handleChatEvent(messages.notCommandMessage);
        Object.values(commands).map(command => expect(command).not.to.be.called);
    });

    it('Expect slack api handle correct and call if body is "!help"', async () => {
        await slackApi.handleChatEvent(messages.help);
        expect(commands.help).to.be.called;
    });
});
