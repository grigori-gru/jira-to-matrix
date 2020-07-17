import { fromString } from 'html-to-text';
import marked from 'marked';
import { getLogger } from '../../modules/log';
import { translate } from '../../locales';
import { getAutoinviteUsers } from '../settings';
import { infoBody } from '../../lib/messages';
import { CreateRoomData, TaskTracker, DescriptionFields } from '../../types';
import { errorTracing } from '../../lib/utils';
import { LINE_BREAKE_TAG, INDENT } from '../../lib/consts';
import { BaseAction, RunAction } from './base-action';
import { ChatFasade } from '../../messengers/chat-fasade';

const logger = getLogger(module);

export const getOpenedDescriptionBlock = data => [LINE_BREAKE_TAG, INDENT, data].join('');

export const getClosedDescriptionBlock = data => [getOpenedDescriptionBlock(data), LINE_BREAKE_TAG].join('');

// eslint-disable-next-line

interface CreateIssueRoomOptions {
    key: string;
    summary: string;
    projectKey: string;
    descriptionFields: DescriptionFields;
    roomName: string;
    statusColors: string[] | string;
}

export class CreateRoom extends BaseAction<ChatFasade, TaskTracker> implements RunAction {
    getEpicInfo(epicLink) {
        epicLink === translate('miss')
            ? ''
            : `            <br>Epic link:
                ${getOpenedDescriptionBlock(epicLink)}
                ${getClosedDescriptionBlock(this.taskTracker.getViewUrl(epicLink))}`;
    }

    getPost(body) {
        const post = `
            Assignee:
                ${getOpenedDescriptionBlock(body.assigneeName)}
            <br>Reporter:
                ${getOpenedDescriptionBlock(body.reporterName)}
            <br>Type:
                ${getClosedDescriptionBlock(body.typeName)}
            <br>Estimate time:
                ${getClosedDescriptionBlock(body.estimateTime)}
            <br>Description:
                ${getClosedDescriptionBlock(marked(body.description))}
            <br>Priority:
                ${getClosedDescriptionBlock(body.priority)}`;

        const epicInfo = this.getEpicInfo(body.epicLink);

        return [post, epicInfo].join('\n');
    }

    getDescription(descriptionFields: DescriptionFields): { body: string; htmlBody: string } {
        try {
            const htmlBody = this.getPost(descriptionFields);
            const body = fromString(htmlBody);

            return { body, htmlBody };
        } catch (err) {
            throw errorTracing('getDescription', err);
        }
    }

    async createIssueRoom(issue: CreateIssueRoomOptions): Promise<void> {
        try {
            const { key, summary, projectKey, descriptionFields, roomName, statusColors } = issue;

            const autoinviteUsers = await getAutoinviteUsers(projectKey, descriptionFields.typeName);

            const issueWatchers = await this.taskTracker.getIssueWatchers(issue.key);
            const issueWatchersChatIds = await Promise.all(
                issueWatchers.map(displayName => this.currentChatItem.getUserIdByDisplayName(displayName)),
            );

            const invite = [...issueWatchersChatIds, ...autoinviteUsers];

            const topic = this.taskTracker.getViewUrl(key);

            const avatarUrl = await this.getAvatarLink(key, statusColors);

            const options = {
                room_alias_name: key,
                invite,
                name: roomName,
                topic,
                purpose: summary,
                avatarUrl,
            };

            const roomId = await this.currentChatItem.createRoom(options);

            logger.info(`Created room for ${key}: ${roomId}`);
            const { body, htmlBody } = this.getDescription(descriptionFields);

            await this.currentChatItem.sendHtmlMessage(roomId, body, htmlBody);
            await this.currentChatItem.sendHtmlMessage(roomId, infoBody, infoBody);
        } catch (err) {
            throw errorTracing('createIssueRoom', err);
        }
    }

    async createProjectRoom(projectKey) {
        try {
            const { lead, name: projectName } = await this.taskTracker.getProject(projectKey);
            const name = this.currentChatItem.composeRoomName(projectKey, projectName);
            const leadUserId = await this.currentChatItem.getUserIdByDisplayName(lead);
            const topic = this.taskTracker.getViewUrl(projectKey);

            const options = {
                room_alias_name: projectKey,
                invite: [leadUserId],
                name,
                topic,
            };

            const roomId = await this.currentChatItem.createRoom(options);
            logger.info(`Created room for project ${projectKey}: ${roomId}`);
        } catch (err) {
            throw errorTracing('createProjectRoom', err);
        }
    }

    async getCheckedIssue(keyOrId): Promise<CreateIssueRoomOptions | false> {
        const issueBody = await this.taskTracker.getIssueSafety(keyOrId);
        if (!issueBody) {
            return false;
        }

        const statusColors = (await this.taskTracker.getCurrentIssueColor(keyOrId)) || this.defaultAvatarColor;

        return {
            key: this.taskTracker.selectors.getIssueKey(issueBody)!,
            summary: this.taskTracker.selectors.getSummary(issueBody)!,
            descriptionFields: this.taskTracker.selectors.getDescriptionFields(issueBody)!,
            projectKey: this.taskTracker.selectors.getProjectKey(issueBody)!,
            roomName: this.taskTracker.selectors.getRoomName(issueBody),
            statusColors,
        };
    }

    hasEmptyPorperty(issue: CreateRoomData['issue']): boolean {
        return !Object.values(issue).find(el => !el);
    }

    async run({ issue, projectKey }: CreateRoomData): Promise<boolean> {
        try {
            const keyOrId = issue.key || issue.id;
            if (issue && keyOrId) {
                const checkedIssue = await this.getCheckedIssue(keyOrId);
                if (!checkedIssue) {
                    logger.warn(`Issue ${keyOrId} is not exists`);

                    return false;
                }
                if (!(await this.currentChatItem.getRoomIdByName(checkedIssue.key))) {
                    await this.createIssueRoom(checkedIssue);
                }
            }
            if (projectKey) {
                (await this.currentChatItem.getRoomIdByName(projectKey)) || (await this.createProjectRoom(projectKey));
            }

            return true;
        } catch (err) {
            throw errorTracing('create room', err);
        }
    }
}
