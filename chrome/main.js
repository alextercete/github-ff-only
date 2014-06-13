var states = {
    MERGED: 0,
    FAST_FORWARD: 1,
    NON_FAST_FORWARD: 2
};

$(function () {
    var pathName = window.location.pathname,
        matches = pathName.match(/^\/(.+?)\/pull\/(\d+)$/),
        repo = matches[1],
        pullRequest = matches[2];

    var accessToken = localStorage.getItem("ff_only.github_access_token"),
        github = new GitHub(accessToken);

    github.getPullRequestState(repo, pullRequest, function (state) {
        switch (state) {
            case states.FAST_FORWARD:
                alert("It's Fast-Forward!");
                break;

            case states.NON_FAST_FORWARD:
                alert("It's NOT Fast-Forward!");
                break;

            default:
                break;
        }
    });
});

var GitHub = function (accessToken) {
    var apiBaseUrl = "https://api.github.com/";

    var getPullRequestState = function (repo, pullRequest, callback) {
        getPullRequest(repo, pullRequest).done(function (json) {
            if (json.merged === true) {
                callback(states.MERGED);
            } else {
                compareCommits(repo, json.base.label, json.head.label).done(function (json) {
                    callback(json["behind_by"] === 0 ? states.FAST_FORWARD : states.NON_FAST_FORWARD);
                });
            }
        });
    };

    var getPullRequest = function (repo, pullRequest) {
        return get(apiBaseUrl + "repos/" + repo + "/pulls/" + pullRequest);
    };

    var compareCommits = function (repo, first, second) {
        return get(apiBaseUrl + "repos/" + repo + "/compare/" + first + "..." + second);
    };

    var get = function (url) {
        var settings = {
            method: "GET",
            url: url,
            dataType: "json"
        };

        if (accessToken) {
            settings.headers = {
                Authorization: "token " + accessToken
            };
        }

        return $.ajax(settings);
    }

    return {
        getPullRequestState: getPullRequestState
    };
};
