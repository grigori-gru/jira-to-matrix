import { Project, Selectors } from '../../types';

export interface GitlabUserData extends GitlabUserDataShort {
    access_level: number;
    expires_at: string | null;
}

export interface HookUser {
    name: string;
    username: string;
    avatar_url: string;
}

export interface GitlabLabelHook {
    id: number;
    title: string;
    color: string;
    project_id: number;
    created_at: string;
    updated_at: string;
    template: boolean;
    description: string;
    type: string;
    group_id: number;
}

export interface GitlabLabel {
    id: number;
    name: string;
    color: string;
    description: string;
    description_html: string;
    text_color: string;
    subscribed: boolean;
    priority: null | string;
    is_project_label: boolean;
}

export enum HookTypes {
    Comment = 'note',
    Issue = 'issue',
    Push = 'push',
}

export interface GitlabCommentHook extends GitlabHook {
    object_kind: HookTypes.Comment;
    project_id: number;
    object_attributes: {
        id: number;
        note: string;
        noteable_type: string;
        attachment: string | null;
        author_id: number;
        change_position: string | null;
        commit_id: string | null;
        created_at: string;
        discussion_id: string;
        line_code: string | null;
        noteable_id: number;
        original_position: string | null;
        position: string | null;
        project_id: number;
        resolved_at: string | null;
        resolved_by_id: string | null;
        resolved_by_push: string | null;
        st_diff: string | null;
        system: boolean;
        type: string | null;
        updated_at: string;
        updated_by_id: string | null;
        description: string;
        url: string;
    };
    issue: {
        id: number;
        title: string;
        assignee_ids: number[];
        assignee_id: string | null;
        author_id: number;
        project_id: number;
        created_at: string;
        updated_at: string;
        position: number;
        branch_name: null;
        description: string;
        milestone_id: null;
        state: string;
        iid: number;
        labels: GitlabLabel[];
    };
}

export interface GitlabIssueHook extends GitlabHook {
    object_kind: string;
    event_type: string;
    object_attributes: {
        id: number;
        title: string;
        assignee_ids: number[];
        assignee_id: number;
        author_id: number;
        project_id: number;
        created_at: string;
        updated_at: string;
        updated_by_id: number;
        last_edited_at: null | string;
        last_edited_by_id: null | string;
        relative_position: number;
        description: string;
        milestone_id: null | string;
        state_id: number;
        confidential: boolean;
        discussion_locked: true;
        due_date: null | string;
        moved_to_id: null | string;
        duplicated_to_id: null | string;
        time_estimate: number;
        total_time_spent: number;
        human_total_time_spent: null | string;
        human_time_estimate: null | string;
        weight: null | string;
        iid: number;
        url: string;
        state: string;
        action: string;
        labels: GitlabLabelHook[];
    };
    assignees: HookUser[];
    labels: GitlabLabelHook[];
    changes: {
        author_id: {
            previous: null | number;
            current: number;
        };
        created_at: {
            previous: null | number;
            current: string;
        };
        description: {
            previous: null | string;
            current: string;
        };
        id: {
            previous: null | number;
            current: number;
        };
        iid: {
            previous: null | number;
            current: number;
        };
        project_id: {
            previous: null | number;
            current: number;
        };
        relative_position: {
            previous: null | number;
            current: number;
        };
        title: {
            previous: null | string;
            current: string;
        };
        updated_at: {
            previous: null | string;
            current: string;
        };
        labels: {
            previous: GitlabLabelHook[];
            current: GitlabLabelHook[];
        };
        assignees: {
            previous: HookUser[];
            current: HookUser[];
        };
    };
}

export interface GitlabHook {
    object_kind: string;
    event_type?: string;
    user: HookUser;
    project: {
        id: number;
        name: string;
        description: string;
        web_url: string;
        avatar_url: null | string | string;
        git_ssh_url: string;
        git_http_url: string;
        namespace: string;
        visibility_level: number;
        path_with_namespace: string;
        default_branch: string;
        ci_config_path: null | string | string;
        homepage: string;
        url: string;
        ssh_url: string;
        http_url: string;
    };
    repository: {
        name: string;
        url: string;
        description: string;
        homepage: string;
    };
    object_attributes: any;
}

export interface GitlabPushCommit {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: {
        name: string;
        email: string;
    };
    added: string[];
    modified: string[];
    removed: string[];
}

export interface GitlabPushHook {
    object_kind: HookTypes.Push;
    event_name: string;
    before: string;
    after: string;
    ref: string;
    checkout_sha: string;
    message: string;
    user_id: number;
    user_name: string;
    user_username: string;
    user_email: string;
    user_avatar: string;
    project_id: number;
    project: GitlabHook['project'];
    commits: GitlabPushCommit[];
    total_commits_count: number;
    push_options: any;
    repository: {
        name: string;
        url: string;
        description: string;
        homepage: string;
        git_http_url: string;
        git_ssh_url: string;
        visibility_level: number;
    };
}

export interface GitlabUserDataShort {
    state: string;
    web_url: string;
    avatar_url: string | null;
    username: string;
    id: number;
    name: string;
}

export interface GitlabIssue {
    project_id: number;
    milestone: {
        due_date: string | null;
        project_id: number;
        state: string;
        description: string;
        iid: number;
        id: number;
        title: string;
        created_at: string;
        updated_at: string;
        start_date?: string | null;
        closed_at?: string | null;
    };
    author: GitlabUserDataShort;
    description: string;
    state: string;
    iid: number;
    assignees: GitlabUserDataShort[];
    assignee: GitlabUserDataShort | null;
    labels: string[];
    upvotes: number;
    downvotes: number;
    merge_requests_count: number;
    id: number;
    title: string;
    updated_at: string;
    created_at: string;
    closed_at: string | null;
    closed_by: string | null;
    subscribed: boolean;
    user_notes_count: number;
    due_date: string | null;
    web_url: string;
    references: {
        short: string;
        relative: string;
        full: string;
    };
    time_stats: {
        time_estimate: number;
        total_time_spent: number;
        human_time_estimate: string | null;
        human_total_time_spent: string | null;
    };
    confidential: boolean;
    discussion_locked: boolean;
    _links: {
        self: string;
        notes: string;
        award_emoji: string;
        project: string;
    };
    task_completion_status: {
        count: number;
        completed_count: number;
    };
}

export interface GitlabProject extends Project {
    id: number;
    description: string;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    created_at: string;
    default_branch: string;
    tag_list: [];
    ssh_url_to_repo: string;
    http_url_to_repo: string;
    web_url: string;
    readme_url: string;
    avatar_url: string | null;
    star_count: number;
    forks_count: number;
    last_activity_at: string;
    namespace: {
        id: number;
        name: string;
        path: string;
        kind: string;
        full_path: string;
        parent_id: string | null;
        avatar_url: string | null;
        web_url: string;
    };
    _links: {
        self: string;
        issues: string;
        merge_requests: string;
        repo_branches: string;
        labels: string;
        events: string;
        members: string;
    };
    empty_repo: boolean;
    archived: boolean;
    visibility: string;
    resolve_outdated_diff_discussions: boolean;
    container_registry_enabled: boolean;
    container_expiration_policy: {
        cadence: string;
        enabled: boolean;
        keep_n: string | null;
        older_than: string | null;
        name_regex: string | null;
        next_run_at: string;
    };
    issues_enabled: boolean;
    merge_requests_enabled: boolean;
    wiki_enabled: boolean;
    jobs_enabled: boolean;
    snippets_enabled: boolean;
    issues_access_level: string;
    repository_access_level: string;
    merge_requests_access_level: string;
    wiki_access_level: string;
    builds_access_level: string;
    snippets_access_level: string;
    shared_runners_enabled: boolean;
    lfs_enabled: boolean;
    creator_id: number;
    import_status: string;
    open_issues_count: number;
    ci_default_git_depth: number;
    public_jobs: boolean;
    build_timeout: number;
    auto_cancel_pending_pipelines: string;
    build_coverage_regex: string | null;
    ci_config_path: string | null;
    shared_with_groups: [];
    only_allow_merge_if_pipeline_succeeds: boolean;
    request_access_enabled: boolean;
    only_allow_merge_if_all_discussions_are_resolved: boolean;
    remove_source_branch_after_merge: boolean;
    printing_merge_request_link_enabled: boolean;
    merge_method: string;
    suggestion_commit_message: string | null;
    auto_devops_enabled: boolean;
    auto_devops_deploy_strategy: string;
    autoclose_referenced_issues: boolean;
    permissions: {
        project_access: {
            access_level: number;
            notification_level: number;
        };
        group_access: string | null;
    };
}

export interface Notes {
    id: number;
    body: string;
    attachment: null | string;
    author: {
        id: number;
        username: string;
        email: string;
        name: string;
        state: string;
        created_at: string;
    };
    created_at: string;
    updated_at: string;
    system: true;
    noteable_id: number;
    noteable_type: string;
    noteable_iid: number;
    resolvable: boolean;
    confidential: boolean;
}

export interface GitlabSelectors extends Selectors {
    getFullNameWithId(body: GitlabPushHook): string;
    keysForCheckIgnore(body): string | string[];
    getCommitKeysBody(body: GitlabPushHook): Record<string, GitlabPushCommit[]>;
    getUploadUrl(body): string | null | undefined;
    isUploadBody(body): boolean;
    getUploadInfo(body): string;
    transformFromKey(key: string): { namespaceWithProject: string; issueId: number };
    transformToKey(namespaceWithProject: string, issueId: number): string;
    // true if hook should be ignored
    isIgnoreHookType(body): boolean;
}
