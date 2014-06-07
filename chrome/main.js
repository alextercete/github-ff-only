$(function () {
    var pathName = window.location.pathname,
        matches = pathName.match(/^\/(.+?)\/pull\/(\d+)$/),
        repo = matches[1],
        pullRequest = matches[2];

    var accessToken = localStorage.getItem("ff_only.github_access_token"),
        github = new GitHub(accessToken);

    // TODO: Allow to filter which repo's will be analyzed

    github.isFastForwardPullRequest(repo, pullRequest, function (result) {
        if (result) {
            alert("It's Fast-Forward!");
        } else {
            alert("It's NOT Fast-Forward!");
        }
    });
});

var GitHub = function (accessToken) {
    var apiBaseUrl = "https://api.github.com/";

    var isFastForwardPullRequest = function (repo, pullRequest, callback) {
        return getPullRequest(repo, pullRequest)
            .then(function (json) {
                return compareCommits(repo, json.base.label, json.head.label);
            })
            .then(function (json) {
                return json["behind_by"] === 0;
            })
            .done(function (result) {
                callback(result);
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
        isFastForwardPullRequest: isFastForwardPullRequest
    };
};
