const jiraRequest = require('../utils');
const {auth} = require('../jira');
const logger = require('simple-color-logger')();
const {t} = require('../locales');
const postfix = require('../config').matrix.postfix;

const baseUrl = 'https://jira.bingo-boom.ru/jira/rest/api/2/issue'

const postComment = async (body, sender, room, roomName, self) => {
    const message = body.substring(9);
    
    // post comment in issue
    const jiraComment = await jiraRequest.fetchPostJSON(
        `${baseUrl}/${roomName}/comment`,
        auth(),
        schemaComment(sender, message)
    );

    if (jiraComment.status !== 201) {
        const post = t('errorMatrixComment');
        await self.sendHtmlMessage(room.roomId, post, post);
        return `
            Comment from ${sender} for ${roomName} not published
            \nJira have status ${iraComment.status}
        `;
    }

    const post = t('successMatrixComment');
    await self.sendHtmlMessage(room.roomId, post, post);
    return `Comment from ${sender} for ${roomName}`;
}

const appointAssignee = async (event, room, roomName, self) => {
    const assignee = getAssgnee(event);
    
    // appointed assignee for issue
    const jiraAssign = await jiraRequest.fetchPutJSON(
        `${baseUrl}/${roomName}/assignee`,
        auth(),
        schemaAssignee(assignee)
    );

    if (jiraAssign.status !== 204) {
        const post = t('errorMatrixAssign', {assignee});
        await self.sendHtmlMessage(room.roomId, post, post);
        return `User ${assignee} or issue ${roomName} don't exist`;
    } 


    const inviteUser = getInviteUser(event, room);
    if (inviteUser) {
        await self.invite(room.roomId, inviteUser);
    }

    // add watcher for issue
    const jiraWatcher = await jiraRequest.fetchPostJSON(
        `${baseUrl}/${roomName}/watchers`,
        auth(),
        schemaWatcher(assignee)
    );

    const post = t('successMatrixAssign', {assignee});
    await self.sendHtmlMessage(room.roomId, post, post);
    return `The user ${assignee} now assignee issue ${roomName}`;
}

const getAssgnee = (event) => {
    const body = event.getContent().body;
    
    if (body === '!assign') {
        const sender = event.getSender();
        return sender.substring(1, sender.length - postfix);
    }

    // 8 it's length command "!assign"
    return body.substring(8);
}

const getInviteUser = (event, room) => {
    const body = event.getContent().body;
    if (body === '!assign') {
        return;
    }

    // 8 it's length command "!assign"
    let user = body.substring(8);
    user = `@${user}:matrix.bingo-boom.ru`;

    // 'members' is an array of objects
    const members = room.getJoinedMembers();
    members.forEach((member) => {
        if (member.userId === user) {
            user = undefined;
        }
        return;
    });

    return user;
}

const issueMove = async (body, room, roomName, self) => {
    const listCommands = await getListCommand(roomName);

    const moveId = listCommands.reduce((res, cur, index) => {
        // check command
        if (checkCommand(body, cur.name, index)) {
            return cur.id;
        }
        return res;
    }, 0);

    if (!moveId) {
        let postListCommands = listCommands.reduce((res, cur, index) => {
            return `${res}&nbsp;&nbsp;${index + 1})&nbsp;${cur.name}<br>`;
        }, '');
        postListCommands = `<b>${t('listJiraCommand')}:</b><br>${postListCommands}`
        await self.sendHtmlMessage(room.roomId, 'list commands', postListCommands);
        return;
    }

    // canged status issue
    const jiraMove = await jiraRequest.fetchPostJSON(
        `${baseUrl}/${roomName}/transitions`,
        auth(),
        schemaMove(moveId)
    )

    if (jiraMove.status !== 204) {
        const post = t('errorMoveJira');
        await self.sendHtmlMessage(room.roomId, 'ERROR', post);
        return `Issue ${roomName} not changed status`;
    }

    const post = t('successMoveJira');
    await self.sendHtmlMessage(room.roomId, post, post);
    return `Issue ${roomName} changed status`;
}

const getListCommand = async (roomName) => {
    // List of available commands
    const moveOptions = await jiraRequest.fetchJSON(
        `${baseUrl}/${roomName}/transitions`,
        auth()
    )

    return moveOptions.transitions.map((move) => {
        return { name: move.name, id: move.id };
    });
}

const checkCommand = (body, name, index) => Boolean(
    ~body.toLowerCase().indexOf(name.toLowerCase()) 
    || ~body.indexOf(String(index + 1))
)

const schemaComment = (sender, message) => {
    const body = `[~${sender}]:\n${message}`
    return JSON.stringify({body});
}

const schemaAssignee = (assignee) => {
    return JSON.stringify({
        "name": `${assignee}`
    });
}

const schemaWatcher = (watcher) => {
    return `"${watcher}"`;
}

const schemaMove = (id) => {
    return JSON.stringify({
        "transition": {
            "id": id
        }
    });
}

module.exports = {
    postComment,
    appointAssignee,
    issueMove,
};