import path from 'path';
import nock from 'nock';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { getChatClass, getRoomId } from '../test-utils';
import { Commands } from '../../src/bot/commands';
import { CommandNames } from '../../src/types';
import { config } from '../../src/config';
import { Gitlab } from '../../src/task-trackers/gitlab';
import projectsJson from '../fixtures/gitlab-api-requests/project-search.gitlab.json';

const { expect } = chai;
chai.use(sinonChai);

describe('gitlab upload test', () => {
    let chatApi;
    let baseOptions;
    const gitlabTracker = new Gitlab({
        url: 'https://gitlab.test-example.ru',
        user: 'gitlab_bot',
        password: 'fakepasswprd',
        features: config.features,
    });
    const commands = new Commands(config, gitlabTracker);
    const projectNamespace = 'indev';
    const projectKey = 'gitlabtomatrix';
    const issueId = '123';

    const alias = projectNamespace + '/' + projectKey + '-' + issueId;

    const commandName = CommandNames.Upload;
    const sender = 'user';
    const roomId = getRoomId();
    const roomData = { alias, id: roomId };

    beforeEach(() => {
        chatApi = getChatClass().chatApiSingle;
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('upload success', () => {
        const bodyText = 'picture.jpeg';
        const basePictureUrl = 'https://matrix.example.com/_matrix/media/r0/download/matrix.example.com';
        const pictureFilePath = '/auSUanXnWTPQAFxnLfhcSGhz';
        const matrixPictureUrl = basePictureUrl.concat(pictureFilePath);

        beforeEach(() => {
            baseOptions = { roomData, sender, chatApi, bodyText, url: matrixPictureUrl };
            const fileName = 'GitLab.png';
            const testPicturePath = path.resolve(__dirname, '..', 'fixtures', fileName);
            const body = {
                url: '/uploads/lalalaal',
                markdown: `![${fileName}](${gitlabTracker.getRestUrl('projects', projectsJson[0].id)})`,
            };

            nock(basePictureUrl)
                .get(pictureFilePath)
                .reply(200, testPicturePath);
            nock(gitlabTracker.getRestUrl())
                .get(`/projects`)
                .query({ search: `${projectNamespace}/${projectKey}` })
                .times(2)
                .reply(200, projectsJson)
                .post(`/projects/${projectsJson[0].id}/uploads`)
                .reply(201, body)
                .post(`/projects/${projectsJson[0].id}/issues/${issueId}/notes`)
                .query({ body: gitlabTracker.getPostCommentBody(sender, body.markdown) })
                .reply(201);
        });

        it('Expect comment to be sent', async () => {
            const result = await commands.run(commandName, baseOptions);
            expect(chatApi.sendHtmlMessage).not.to.be.called;
            expect(result).to.be.undefined;
        });
    });
});
