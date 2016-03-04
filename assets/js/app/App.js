BIND_PATH = '/http-bind';
BOSH_URL = window.location.protocol + '//' + window.location.hostname + BIND_PATH;
//BOSH_URL = 'http://loki.gltd.net:7070/http-bind/';
App = {};
Session = {};
App.start = function(options) {
    App.options = options;
    console.log('Application Started');
    if (App.options.app.username) {
        $('#username').val(App.options.app.username);
    }
    if (App.options.app.password) {
        $('#password').val(App.options.app.password);
    }

    if (App.options.app.autologon) {
        $('#gc_signin').click();
    }
}

App.debug = function() {
    if (App.options.app.debug) {
        return true;
    }
    return false;
}

App.clear = function() {
    if (Session.connection) {
        Session.connection.disconnect();
        Session.connection = null;
        console.log("XMPP Disconnect");
    }
}

App.connected = function(connection) {
    Session.connection = connection;
    $('#gc_login_window').hide();
    $('#gc_logout_window').show();
    Session.connection.openlink.profiles = {};

    Session.connection.openlink.sendPresence();

    Session.callHandlerId = Session.connection.openlink.addCallHandler(App.callHandler);
}

App.callHandler = function(callEv, changed) {
    // do something
    console.log("CALL HANDLER: " + changed + " callEv: " + JSON.stringify(callEv));

    if (callEv.id) {
        $('#gc_call_list ul').empty();
        var calls = Session.connection.openlink.calls;
        for (var cid in Session.connection.openlink.calls) {
            var call = calls[cid];

            var callText = '<li>' + call.id + ' - '
                + call.profile + ' - '
                + call.interest + ' - '
                + call.state + ' - '
                + call.direction;
                if (call.actions.length > 0) {
                    callText += '<ul>';
                    for (var _i = 0; _i < call.actions.length; _i++) {
                        callText += '<li>Action: ' + call.actions[_i] + '</li>';
                        console.log("CALL TO ARMS!",call.actions[_i]);
                    }
                    callText += '</ul>';
                } else {
                    callText += '<ul><li>No actions available</li></ul>';
                }

            callText += '</li>';

            $('#gc_call_list ul:first').append(callText);
        }
    }

}

App.disconnected = function() {
    $('#gc_logout_window').hide();
    $('#gc_login_window').show();
    $('#gc_profile_list ul').empty();
    $('#gc_interest_list ul').empty();
    $('#gc_feature_list ul').empty();
    $('#gc_recording ul').empty();

    Session.connection.openlink.removeCallHandler(Session.callHandlerId);
    delete Session.callHandlerId;
}

$(function() {
});

$(window).unload(function() {
   if (App) {
       App.clear();
   }
});

$('#gc_signin').click(function() {
    App.clear();

    var username = $('#username').val();
    var password = $('#password').val();

    if (username && password) {
        Session.connection = new Strophe.Connection(BOSH_URL
            // ,{
            //     "cookies": {
            //         "testCookie-1234": {
            //             "value": "1234",
            //             "domain": "localhost"
            //         }
            //     },
            //     "withCredentials": true
            // }
        );
        connect({
            username: username,
            password: password,
            resource: App.options.app.xmpp_resource,
            domain: App.options.app.xmpp_domain
        });
    }
});

$('#gc_signout').click(function() {
    Session.connection.disconnect();
});

$('#gc_get_profiles').click(function() {
    $('#gc_profile_list ul').empty();
    $('#gc_profile_list ul').append('<li>Loading profiles</li>');
    Session.connection.openlink.getProfiles(getDefaultSystem(), function(profiles) {
        $('#gc_profile_list ul').empty();
        for (var profileId in profiles) {
            var profile = profiles[profileId];

            var profileText = '<li>'
                + profile.id + ' - '
                + profile.device + ' - '
                + '<a href="#" class="gc_get_features" id="gc_get_features_'+ profile.id +'" data-device="' + profile.device + '">Get features</a>' + ' - '
                + '<a href="#" class="gc_get_interests" id="gc_get_interests_'+ profile.id +'" data-device="' + profile.device + '">Get interests</a>';

            if (profile.actions.length > 0) {
                profileText += '<ul>';
                for (var _i = 0; _i < profile.actions.length; _i++) {
                    profileText += '<li>Action: '
                        + profile.actions[_i].id + ' - '
                        + profile.actions[_i].label
                        + '</li>';
                }
                profileText += '</ul>';
            } else {
                profileText += '<ul><li>No actions found</li></ul>';
            }

            profileText += '</li>';

            $('#gc_profiles ul:first').append(profileText);
        }
    }, function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_get_profiles_vms').click(function() {
    Session.connection.openlink.getProfiles(getVMSSystem(), function(profiles) {
        $('#gc_profile_list ul').empty();
        for (var profileId in profiles) {
            var profile = profiles[profileId];

            var profileText = '<li>'
                + profile.id + ' - '
                + profile.device + ' - '
                + '<a href="#" class="gc_get_features" id="gc_get_features_'+ profile.id +'" data-device="' + profile.device + '">Get features</a>' + ' - '
                + '<a href="#" class="gc_get_interests" id="gc_get_interests_'+ profile.id +'" data-device="' + profile.device + '">Get interests</a>';

            if (profile.actions.length > 0) {
                profileText += '<ul>';
                for (var _i = 0; _i < profile.actions.length; _i++) {
                    profileText += '<li>Action: '
                        + profile.actions[_i].id + ' - '
                        + profile.actions[_i].label
                        + '</li>';
                }
                profileText += '</ul>';
            } else {
                profileText += '<ul><li>No actions found</li></ul>';
            }

            profileText += '</li>';

            $('#gc_profiles ul:first').append(profileText);

            var recordText = '<li>' + profile.id + ' - '
                + '<a href="#" class="gc_record" id="gc_record_' + profile.id + '">Record</a> -'
                + '<input type="text" maxlength="50" id="record_label_' + profile.id + '" placeholder="Label"></label>'
                + '<div id="recording_number">'
                + '</div>';
            recordText += '</li>';

            if (profile.device === "vmstsp") {
                $('#gc_recording ul:first').append(recordText);
            };

        }
    }, function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_get_profiles_gtx').click(function() {
    Session.connection.gtx.getProfiles(getDefaultSystem(), function(profiles) {
        console.log(profiles);
    }, function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_profiles').on('click', 'a.gc_get_interests', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_get_interests_', '');
    }
    if (e.target.dataset.device) {
        var device = e.target.dataset.device;
    }
    getInterestsClick(profileId, device);
});

function getInterestsClick(profileId, device) {
    // $('#gc_interest_list ul').empty();
    // $('#gc_interest_list ul').append('<li>Loading interests</li>');
    var system = (device === 'vmstsp'? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.getInterests(system, profileId, function(interests) {
        // $('#gc_interest_list ul').empty();
        var vmstsp;
        for (var elem in interests) {
            var interestId = encodeURIComponent(interests[elem].id);
            if (!$(document.getElementById(interestId)).html()) {
                $('#gc_interest_list ul').append('<div id="interest_' + interestId + '"><li>'
                    + interests[elem].id + ' - '
                    + interests[elem].type + ' - '
                    + interests[elem].label + ' - '
                    + '<a href="#" class="gc_subscribe_interest" id="gc_subscribe_interest_'+ interestId +'">Subscribe</a>' + ' - '
                    + '<a href="#" class="gc_unsubscribe_interest" id="gc_unsubscribe_interest_'+ interestId +'">Unsubscribe</a>'

                    + '<div class="gc_makecall" id="gc_makecall_' + interestId + '">'
                    + '<a href="#" class="gc_makecall_interest" id="gc_makecall_interest_'+ interestId +'">Make Call</a>' 
                    + ' ' + '<a href="#" class="gc_makecall_interest_conf" id="gc_makecall_interest_conf_'+ interestId +'">(conf)</a>'
                    + ' - '
                    + '<input type="text" maxlength="50" value="" class="makecall_extension" id="makecall_extension_' + interestId + '" placeholder="Extension">'
                    + '</div>'

                    + '</li></div>');
            }
            if (elem.indexOf('vmstsp') > -1 && interests[elem].default) {
                createBlastWells(interests[elem]);
            }
        }
    }, function(message) {
        console.log("ALERT:",message);
    });
}

function createBlastWells(interest) {
    var interestId = interest.id;
    $("#gc_blast").empty();

    var blastText = '<div id="gc_blast_dests"><ul><li>Dest: <input type="text" maxlength="100" value="" class="blast_dest" id="blast_dest" placeholder="Destination..."></li></ul>'
            + '<button id="add_blast_dest">+</button><button id="remove_blast_dest">-</button></div>'
            + '<div id="gc_blast_keys"><ul><li>Key: <input type="text" maxlength="100" value="" class="blast_keys" id="blast_keys" placeholder="Msg ID (e.g. MK1234)"></li></ul>'
            + '<button id="add_blast_key">+</button><button id="remove_blast_key">-</button></div>'
            + '<br/><button class="vm_blast" id="vm_blast_' + interestId + '">Blast</button>';
    $("#gc_blast").append(blastText);
}

$('#gc_profiles').on('click', 'a.gc_get_features', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_get_features_', '');
    }
    if (e.target.dataset.device) {
        var device = e.target.dataset.device;
    }
    getFeaturesClick(profileId, device);
});

function getFeaturesClick(profileId, device) {
    // $('#gc_feature_list ul').empty();
    // $('#gc_feature_list ul').append('<li>Loading features</li>');
    var system = (device === 'vmstsp'? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.getFeatures(system, profileId, function(features) {
        // $('#gc_feature_list ul').empty();
        var featureText = '<div id="profile_' + profileId + '"><li>'
            + profileId;

        featureText += '<ul>';
        for (var elem in features) {
            featureText += '<li>'
                + features[elem].id + ' - '
                + features[elem].type + ' - '
                + features[elem].label;
            featureText += (features[elem].id.indexOf('MK') > -1? ' - <a href="#" class="gc_feature_playback" id="gc_feature_playback_' + profileId + '_' + features[elem].id + '">Playback</a><div id="playback_number_' + features[elem].id + '"</li>':'</li>');
        }
        featureText += '</ul>';

        featureText += '</li></div>';
        if ($("#profile_" + profileId).html()){
            $("#profile_" + profileId).remove();
        }

        $('#gc_feature_list ul:first').append(featureText);

    }, function(message) {
        console.log("ALERT:",message);
    });
}

$('#gc_interests').on('click', 'a.gc_subscribe_interest', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interest = e.target.id.replace('gc_subscribe_interest_', '');
        interest = decodeURIComponent(interest);
    }
    Session.connection.openlink.subscribe(Session.connection.openlink.getPubsubAddress(), interest, function(message) {
        console.log("ALERT:",message);
    }, function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_interests').on('click', 'a.gc_unsubscribe_interest', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interest = e.target.id.replace('gc_unsubscribe_interest_', '');
        interest = decodeURIComponent(interest);
    }
    Session.connection.openlink.unsubscribe(Session.connection.openlink.getPubsubAddress(), interest, function(message) {
        console.log("ALERT:",message);
    }, function(message) {
        console.log("ERROR ALERT:",message);
    });
});

$('#gc_interests').on('click', 'a.gc_makecall_interest', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interestCoded = e.target.id.replace('gc_makecall_interest_', '');
        var interest = e.target.id.replace('gc_makecall_interest_', '');
        interest = decodeURIComponent(interest);
    }
    var system = (interest.indexOf('vmstsp') > -1? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.makeCall(system, interest, $(document.getElementById("makecall_extension_" + interestCoded)).val(),
        [
            // { id: 'Conference', value1: false },
            // { id: 'CallBack', value1: true }
        ], function(call) {
            console.log("ALERT:",'Call made with id: ' + call.id);
        },function(message) {
            console.log("ALERT:",message);
        });
});

$('#gc_interests').on('click', 'a.gc_makecall_interest_conf', function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interest = e.target.id.replace('gc_makecall_interest_conf_', '');
    }
    var system = (interest.indexOf('vmstsp') > -1? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.makeCall(system, interest, $(document.getElementById("makecall_extension_" + interest).val(),
        [
            { id: 'Conference', value1: true },
            { id: 'CallBack', value1: true }
        ], function(call) {
            console.log("ALERT:",'Call made with id: ' + call.id);
        },function(message) {
            console.log("ALERT:",message);
        });
});

$('#gc_request_action').click(function() {
    var callId = $("#request_action_callid").val();
    var actionId = $("#request_action_actionid").val();
    var value1 = $("#request_action_value1").val();
    var value2 = $("#request_action_value2").val();
    var call = Session.connection.openlink.calls[callId]
    if (call && call.interest) {
        var interest = call.interest;
    }
    var system = (interest.indexOf('vmstsp') > -1? getVMSSystem() : getDefaultSystem());

    Session.connection.openlink.requestAction(system, interest, callId, new Action({id: actionId, value1: value1, value2: value2}),function(call) {
        if (call) {
            console.log("ALERT:",'Call actioned with id: ' + call.id);
        }
    },function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_get_history').click(function() {
    $('#gc_history_list ul').empty();
    $('#gc_history_list ul').append('<li>Loading history</li>');
    Session.connection.openlink.getCallHistory(getDefaultSystem(), "", 
        "", "", "", "incoming", "", "", "", "5", function(history) {
        $('#gc_history_list ul').empty();
        if (history) {
            console.log(history);
        }

        for (var callid in history) {
            var call = history[callid];

            var historyText = call.id + '<ul>';

            for (var property in call) {
                historyText += '<li>' + property + ': ' + call[property] + '</li>';
            }

            historyText += '</ul>';
            $('#gc_history_list ul:first').append(historyText);
        }

    },function(message) {
        console.log("ALERT:",message);
    });
});

// VMS stuff
$('#gc_recording').on('click', 'a.gc_record', function(e) {
    e.preventDefault();
    console.log('Requesting record');
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_record_', '');
        var label = $('#record_label_' + profileId).val();
    }
    Session.connection.openlink.manageVoiceMessageRecord(getVMSSystem(), profileId, label, function(recordFeatures) {
        console.log(recordFeatures);
        $('#recording_number').text('Record extension: ' + recordFeatures.exten);
    }, function(message) {
        console.log("ALERT:",message);
    });
});
$('#gc_feature_list').on('click', 'a.gc_feature_playback', function(e) {
    e.preventDefault();
    console.log("Requesting playback");
    if (e.target.id) {
        var string = e.target.id.replace('gc_feature_playback_', '');
        string = string.split('_');
        var profileId = string[0] + '_' + string[1];
        var feature = string[2];
    }
    Session.connection.openlink.manageVoiceMessagePlayback(getVMSSystem(), profileId, feature, function(playbackFeatures) {
        console.log(playbackFeatures);
        $('#playback_number_' + feature).text('Playback extension: ' + playbackFeatures.exten);
    }, function(message) {
        console.log("ALERT:",message);
    });
});

$('#gc_blast').on('click', '#add_blast_dest', function(e) {
    e.preventDefault();
    var blastDest = '<li>Dest: <input type="text" maxlength="100" class="blast_dest" id="blast_dest" placeholder="Destination..."></label></li>';
    $('#gc_blast_dests ul:last').append(blastDest);

});
$('#gc_blast').on('click', '#remove_blast_dest', function(e) {
    e.preventDefault();
    $('#gc_blast_dests ul li:last-child').remove();

});
$('#gc_blast').on('click', '#add_blast_key', function(e) {
    e.preventDefault();
    var blastDest = '<li>Key: <input type="text" maxlength="100" class="blast_keys" id="blast_keys" placeholder="Msg ID (e.g. MK1234)"></label></li>';
    $('#gc_blast_keys ul:last').append(blastDest);

});
$('#gc_blast').on('click', '#remove_blast_key', function(e) {
    e.preventDefault();
    $('#gc_blast_keys ul li:last-child').remove();

});
$('#gc_blast').on('click', '.vm_blast', function(e) {
    e.preventDefault();
    var dests = [];
    $('input[id="blast_dest"]').each(function() {
        dests.push($(this).val());
    });
    var keys = [];
    $('input[id="blast_keys"]').each(function() {
        keys.push($(this).val());
    });
    var interestId = e.target.id.replace('vm_blast_', '');
    var profileId = interestId.split('_vmstsp')[0];
    var offset = "0";
    Session.connection.openlink.manageVoiceBlast(getVMSSystem(), profileId, interestId, keys, dests, offset, function(iq) {
        console.log(iq);
    }, function(message) {
        console.log("ALERT:",message);
    });
});



function getDefaultSystem() {
    return App.options.app.system + '.' + Session.connection.domain;
}

function getVMSSystem() {
    return 'vmstsp.' + Session.connection.domain;
}

function connect(data) {
    console.log("Connect to: " + BOSH_URL);

    Session.connection.rawInput = function(body) {
        if (App.debug()) {
            console.log('RECV: ' + body);
        }
    };

    Session.connection.rawOutput = function(body) {
        if (App.debug()) {
            console.log('SENT: ' + body);
        }
    };

    var connectionCallback = function(status) {
        if (status == Strophe.Status.ERROR) {
            console.log('Strophe connection error.');
        } else if (status == Strophe.Status.CONNECTING) {
            console.log('Strophe is connecting.');
        } else if (status == Strophe.Status.CONNFAIL) {
            console.log('Strophe failed to connect.');
        } else if (status == Strophe.Status.AUTHENTICATING) {
            console.log('Strophe is authenticating.');
        } else if (status == Strophe.Status.AUTHFAIL) {
            console.log('Strophe failed to authenticate.');
        } else if (status == Strophe.Status.CONNECTED) {
            console.log('Strophe is connected.');
            App.connected(this);
        } else if (status == Strophe.Status.DISCONNECTED) {
            console.log('Strophe is disconnected.');
            App.disconnected();
        } else if (status == Strophe.Status.DISCONNECTING) {
            console.log('Strophe is disconnecting.');
        } else if (status == Strophe.Status.ATTACHED) {
            console.log('Strophe is attached.');
        } else {
            console.log('Strophe unknown: ' + status);
        }
    };

    var jid = data.username + "@" + data.domain + "/" + data.resource;
    console.log("Connect: jid: " + jid);
    Session.connection.connect(jid, data.password, connectionCallback);
}


