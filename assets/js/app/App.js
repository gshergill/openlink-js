BIND_PATH = '/http-bind';
BOSH_URL = window.location.protocol + '//' + window.location.hostname + BIND_PATH;
//BOSH_URL = 'http://loki.gltd.net:7070/http-bind/';
App = {};
Session = {};

App.debug = function() {
    if (App.options.app.debug) {
        return true;
    }
    return false;
};

App.clear = function() {
    if (App && Session.connection) {
        Session.connection.disconnect();
        Session.connection = null;
        console.log("XMPP Disconnect");
    }
};

window.onunload = App.clear();

App.signInClick = function() {
    App.clear();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username && password) {
        Session.connection = new Strophe.Connection(BOSH_URL
            ,{
                "cookies": {
                    "testCookie-1234": {
                        "value": "1234",
                        "path": "/"
                    }
                },
                "withCredentials": true
            }
        );
        connect({
            username: username,
            password: password,
            resource: App.options.app.xmpp_resource,
            domain: App.options.app.xmpp_domain
        });
    }
};

App.start = function(options) {
    App.options = options;
    console.log('Application Started');
    if (App.options.app.username) {
        document.getElementById('username').value = App.options.app.username;
    }
    if (App.options.app.password) {
        document.getElementById('password').value = App.options.app.password;
    }
    if (App.options.app.autologon) {
        App.signInClick();
    }
};

var signInButton = document.getElementById('gc_signin');
signInButton.addEventListener('click', App.signInClick);

App.signOutClick = function() {
    Session.connection.disconnect();
}

var signOutButton = document.getElementById('gc_signout');
signOutButton.addEventListener('click', App.signOutClick);

App.connected = function(connection) {
    Session.connection = connection;
    document.getElementById('gc_login_window').style.display = "none";
    document.getElementById('gc_logout_window').style.display = "block";

    // var xhttp;
    // xhttp = new XMLHttpRequest();
    // xhttp.open("POST", "http://localhost/cookies", true);
    // xhttp.onload = function () {
    //     console.log(xhttp.responseText);
    // };
    // xhttp.send("test");

    Session.connection.openlink.profiles = {};

    Session.connection.openlink.sendPresence();

    Session.callHandlerId = Session.connection.openlink.addCallHandler(App.callHandler);
}

App.disconnected = function() {
    document.getElementById('gc_login_window').style.display = "block";
    document.getElementById('gc_logout_window').style.display = "none";
    document.getElementById('gc_profile_list').innerHTML = "";
    document.getElementById('gc_interest_list').innerHTML = "";
    document.getElementById('gc_feature_list').innerHTML = "";
    document.getElementById('gc_recording').innerHTML = "";
    document.getElementById('gc_history_list').innerHTML = "";
    document.getElementById('gc_call_list').innerHTML = "";

    Session.connection.openlink.removeCallHandler(Session.callHandlerId);
    delete Session.callHandlerId;
}

App.callHandler = function(callEv, changed) {
    // do something
    console.log("CALL HANDLER: " + changed + " callEv: " + JSON.stringify(callEv));

    if (callEv.id) {
        document.getElementById('gc_call_list').innerHTML = "";
        var calls = Session.connection.openlink.calls;
        if (document.getElementById('gc_call_list').getElementsByTagName('ul').length < 1) {
            var ulElement = document.createElement('ul');
            document.getElementById('gc_call_list').appendChild(ulElement);
        }
        for (var cid in Session.connection.openlink.calls) {
            var call = calls[cid];

            var list = document.createElement('li');

            var callText = document.createTextNode(call.id + ' - '
                + call.profile + ' - '
                + call.interest + ' - '
                + call.state + ' - '
                + call.direction);

            var actionUl = document.createElement('ul');
            if (call.actions.length > 0) {
                for (var _i = 0; _i < call.actions.length; _i++) {
                    var actionLi = document.createElement('li');
                    var actionText = document.createTextNode('Action: ' + call.actions[_i]);
                    actionLi.appendChild(actionText);
                    actionUl.appendChild(actionLi);
                }
            } else {
                var actionLi = document.createElement('li');
                var actionText = document.createTextNode('No actions available');
                actionLi.appendChild(actionText);
                actionUl.appendChild(actionLi);
            }

            list.appendChild(callText);
            list.appendChild(actionUl);

            var elemList = document.getElementById('gc_call_list').getElementsByTagName('ul')[0];

            elemList.appendChild(list);
        }
    }

}

App.getProfilesClick = function() {
    document.getElementById('gc_profile_list').innerHTML = "";
    document.getElementById('gc_recording').innerHTML = "";
    document.getElementById('gc_interest_list').innerHTML = "";
    document.getElementById('gc_feature_list').innerHTML = "";
    var ulElement = document.createElement('ul');
    var liElement = document.createElement('li');
    var liText = document.createTextNode('Loading Profiles');
    liElement.appendChild(liText);
    ulElement.appendChild(liElement);
    document.getElementById('gc_profile_list').appendChild(ulElement);
    Session.connection.openlink.getProfiles(getDefaultSystem(), function(profiles) {
        document.getElementById('gc_profile_list').innerHTML = "";
        for (var profileId in profiles) {
            var profile = profiles[profileId];

            var profileUl = document.createElement('ul');
            var profileLi = document.createElement('li');
            var featuresBtn = document.createElement('a');
            featuresBtn.className = "gc_get_features";
            featuresBtn.id = "gc_get_features_" + profile.id;
            featuresBtn.href = "#";
            featuresBtn.dataset.device = profile.device;
            featuresBtn.innerHTML = "Get Features";
            var featuresInterestsDiv = document.createElement('span');
            featuresInterestsDiv.innerHTML = " - ";
            var interestsBtn = document.createElement('a');
            interestsBtn.className = "gc_get_interests";
            interestsBtn.id = "gc_get_interests_" + profile.id;
            interestsBtn.href = "#";
            interestsBtn.dataset.device = profile.device;
            interestsBtn.innerHTML = "Get Interests";
            var profileText = document.createTextNode(profile.id + ' - '
                + profile.device + ' - ');

            var profileActionsUl = document.createElement('ul');

            if (profile.actions.length > 0) {
                for (var _i = 0; _i < profile.actions.length; _i++) {
                    var profileActionsLi = document.createElement('li');
                    var profileActionsText = document.createTextNode('Action: '
                        + profile.actions[_i].id + ' - '
                        + profile.actions[_i].label);
                    profileActionsLi.appendChild(profileActionsText);
                    profileActionsUl.appendChild(profileActionsLi);
                }
            } else {
                var profileActionsLi = document.createElement('li');
                var profileActionsText = document.createTextNode('No actions found');
                profileActionsLi.appendChild(profileActionsText);
                profileActionsUl.appendChild(profileActionsLi);
            }

            profileLi.appendChild(profileText);
            profileLi.appendChild(featuresBtn);
            profileLi.appendChild(featuresInterestsDiv);
            profileLi.appendChild(interestsBtn);
            profileLi.appendChild(profileActionsUl);
            profileUl.appendChild(profileLi);
            document.getElementById('gc_profile_list').appendChild(profileUl);

            var getFeaturesBtn = document.getElementById('gc_get_features_' + profile.id);
            getFeaturesBtn.addEventListener('click', App.getFeatures);

            var getInterestBtn = document.getElementById('gc_get_interests_' + profile.id);
            getInterestBtn.addEventListener('click', App.getInterests);
        }
    }, function(message) {
        console.log("ALERT:",message);
    });
};

App.getProfilesVmsClick = function() {
    document.getElementById('gc_profile_list').innerHTML = "";
    document.getElementById('gc_recording').innerHTML = "";
    document.getElementById('gc_interest_list').innerHTML = "";
    document.getElementById('gc_feature_list').innerHTML = "";
    var ulElement = document.createElement('ul');
    var liElement = document.createElement('li');
    var liText = document.createTextNode('Loading Profiles');
    liElement.appendChild(liText);
    ulElement.appendChild(liElement);

    Session.connection.openlink.getProfiles(getVMSSystem(), function(profiles) {        
        for (var profileId in profiles) {
            var profile = profiles[profileId];

            var profileUl = document.createElement('ul');
            var profileLi = document.createElement('li');
            var featuresBtn = document.createElement('a');
            featuresBtn.className = "gc_get_features";
            featuresBtn.id = "gc_get_features_" + profile.id;
            featuresBtn.href = "#";
            featuresBtn.dataset.device = profile.device;
            featuresBtn.innerHTML = "Get Features";
            var featuresInterestsDiv = document.createElement('span');
            featuresInterestsDiv.innerHTML = " - ";
            var interestsBtn = document.createElement('a');
            interestsBtn.className = "gc_get_interests";
            interestsBtn.id = "gc_get_interests_" + profile.id;
            interestsBtn.href = "#";
            interestsBtn.dataset.device = profile.device;
            interestsBtn.innerHTML = "Get Interests";
            var profileText = document.createTextNode(profile.id + ' - '
                + profile.device + ' - ');

            var profileActionsUl = document.createElement('ul');

            if (profile.actions.length > 0) {
                for (var _i = 0; _i < profile.actions.length; _i++) {
                    var profileActionsLi = document.createElement('li');
                    var profileActionsText = document.createTextNode('Action: '
                        + profile.actions[_i].id + ' - '
                        + profile.actions[_i].label);
                    profileActionsLi.appendChild(profileActionsText);
                    profileActionsUl.appendChild(profileActionsLi);
                }
            } else {
                var profileActionsLi = document.createElement('li');
                var profileActionsText = document.createTextNode('No actions found');
                profileActionsLi.appendChild(profileActionsText);
                profileActionsUl.appendChild(profileActionsLi);
            }

            profileLi.appendChild(profileText);
            profileLi.appendChild(featuresBtn);
            profileLi.appendChild(featuresInterestsDiv);
            profileLi.appendChild(interestsBtn);
            profileLi.appendChild(profileActionsUl);
            profileUl.appendChild(profileLi);
            document.getElementById('gc_profile_list').appendChild(profileUl);

            var getFeaturesBtn = document.getElementById('gc_get_features_' + profile.id);
            getFeaturesBtn.addEventListener('click', App.getFeatures);

            var getInterestBtn = document.getElementById('gc_get_interests_' + profile.id);
            getInterestBtn.addEventListener('click', App.getInterests);

            if (profile.device === "vmstsp") {
                var recordUl = document.createElement('ul');
                var recordLi = document.createElement('li');
                var recordText = document.createTextNode(profile.id + ' - ');

                var recordBtn = document.createElement('a');
                recordBtn.href = "#";
                recordBtn.className = "gc_record";
                recordBtn.id = "gc_record_" + profile.id;
                recordBtn.innerHTML = "Record";
                var recordLabel = document.createElement('input');
                recordLabel.type = "text";
                recordLabel.maxlength = "50";
                recordLabel.id = "record_label_" + profile.id;
                recordLabel.placeholder = "Label";
                var recordNumber = document.createElement('div');
                recordNumber.id = "recording_number";

                recordLi.appendChild(recordText);
                recordLi.appendChild(recordBtn);
                recordLi.appendChild(recordLabel);
                recordLi.appendChild(recordNumber);
                recordUl.appendChild(recordLi);
                document.getElementById('gc_recording').appendChild(recordUl);

                var getRecordNumber = document.getElementById('gc_record_' + profile.id);
                getRecordNumber.addEventListener('click', App.record);
            }

        }
    }, function(message) {
        console.log("ALERT:",message);
    });
};

App.getProfilesGtxClick = function() {
    document.getElementById('gc_profile_list').innerHTML = "";
    document.getElementById('gc_recording').innerHTML = "";
    document.getElementById('gc_interest_list').innerHTML = "";
    document.getElementById('gc_feature_list').innerHTML = "";
    Session.connection.gtx.getProfiles(getDefaultSystem(), function(profiles) {
        console.log(profiles);
    }, function(message) {
        console.log("ALERT:",message);
    });
};

var getProfilesButton = document.getElementById('gc_get_profiles');
getProfilesButton.addEventListener('click', App.getProfilesClick);
var getProfilesVmsButton = document.getElementById('gc_get_profiles_vms');
getProfilesVmsButton.addEventListener('click', App.getProfilesVmsClick);
var getProfilesGtxButton = document.getElementById('gc_get_profiles_gtx');
getProfilesGtxButton.addEventListener('click', App.getProfilesGtxClick);

App.getInterests = function(e) {
    e.preventDefault();
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_get_interests_', '');
    }
    if (e.target.dataset.device) {
        var device = e.target.dataset.device;
    }
    getInterestsClick(profileId, device);
};

function getInterestsClick(profileId, device) {
    var system = (device === 'vmstsp'? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.getInterests(system, profileId, function(interests) {
        var vmstsp;
        document.getElementById('gc_interest_list').innerHTML = "";
        for (var elem in interests) {
            var interestId = encodeURIComponent(interests[elem].id);
            if (!document.getElementById('interest_' + interestId)) {
                var interestUl = document.createElement('ul');
                var interestDiv = document.createElement('div');
                interestDiv.id = "interest_" + interestId;
                var interestLi = document.createElement('li');
                var interestText = document.createTextNode(interests[elem].id + ' - '
                    + interests[elem].type + ' - '
                    + interests[elem].label + ' - ');

                var subscribeBtn = document.createElement('a');
                subscribeBtn.className = "gc_subscribe_interest";
                subscribeBtn.id = "gc_subscribe_interest_" + interestId;
                subscribeBtn.href = "#";
                subscribeBtn.innerHTML = "Subscribe";
                var subscribeUnsuscribeSpan = document.createElement('span');
                subscribeUnsuscribeSpan.innerHTML = " - ";
                var unsubscribeBtn = document.createElement('a');
                unsubscribeBtn.className = "gc_unsubscribe_interest";
                unsubscribeBtn.id = "gc_unsubscribe_interest_" + interestId;
                unsubscribeBtn.href = "#";
                unsubscribeBtn.innerHTML = "Unsubscribe";

                var makeCallDiv = document.createElement('div');
                makeCallDiv.className = "gc_makecall";
                makeCallDiv.id = "gc_makecall_" + interestId;
                var makeCallBtn = document.createElement('a');
                makeCallBtn.href = "#";
                makeCallBtn.className = "gc_makecall_interest";
                makeCallBtn.id = "gc_makecall_interest_" + interestId;
                makeCallBtn.innerHTML = "Make Call";
                var makeCallMakeCallConfSpan = document.createElement('span');
                makeCallMakeCallConfSpan.innerHTML = " ";
                var makeCallConfBtn = document.createElement('a');
                makeCallConfBtn.href = "#";
                makeCallConfBtn.className = "gc_makecall_interest_conf";
                makeCallConfBtn.id = "gc_makecall_interest_conf_" + interestId;
                makeCallConfBtn.innerHTML = "(conf)";
                var makeCallDest = document.createElement('input');
                makeCallDest.type = "text";
                makeCallDest.maxlength = "50";
                makeCallDest.value = "";
                makeCallDest.className = "makecall_extension";
                makeCallDest.id = "makecall_extension_" + interestId;
                makeCallDest.placeholder = "Extension";

                makeCallDiv.appendChild(makeCallBtn);
                makeCallDiv.appendChild(makeCallMakeCallConfSpan);
                makeCallDiv.appendChild(makeCallConfBtn);
                makeCallDiv.appendChild(makeCallDest);

                interestLi.appendChild(interestText);
                interestLi.appendChild(subscribeBtn);
                interestLi.appendChild(subscribeUnsuscribeSpan);
                interestLi.appendChild(unsubscribeBtn);
                interestLi.appendChild(makeCallDiv);
                interestDiv.appendChild(interestLi);
                interestUl.appendChild(interestDiv);
                document.getElementById('gc_interest_list').appendChild(interestUl);

                var getSubscribeBtn = document.getElementById('gc_subscribe_interest_' + interestId);
                getSubscribeBtn.addEventListener('click', App.subscribe);

                var getUnsubscribeBtn = document.getElementById('gc_unsubscribe_interest_' + interestId);
                getUnsubscribeBtn.addEventListener('click', App.unsubscribe);

                var getMakeCallBtn = document.getElementById('gc_makecall_interest_' + interestId);
                getMakeCallBtn.addEventListener('click', App.makeCall);

                var getMakeCallConfBtn = document.getElementById('gc_makecall_interest_conf_' + interestId);
                getMakeCallConfBtn.addEventListener('click', App.makeCallConf);
                
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
    document.getElementById("gc_blast").innerHTML = "";

    // Blast Destinations
    var blastDestDiv = document.createElement('div');
    blastDestDiv.id = "gc_blast_dests";
    var blastDestUl = document.createElement('ul');
    var blastDestLi = document.createElement('li');
    var blastDestLiText = document.createTextNode('Dest: ');
    var blastDestLiInput = document.createElement('input');
    blastDestLiInput.type = "text";
    blastDestLiInput.maxlength = "100";
    blastDestLiInput.className = "blast_dest";
    blastDestLiInput.id = "blast_dest";
    blastDestLiInput.placeholder = "Destination...";
    blastDestLi.appendChild(blastDestLiText);
    blastDestLi.appendChild(blastDestLiInput);

    var blastDestAdd = document.createElement('button');
    blastDestAdd.id = "add_blast_dest";
    blastDestAdd.innerHTML = "+";
    var blastDestRemove = document.createElement('button');
    blastDestRemove.id = "remove_blast_dest";
    blastDestRemove.innerHTML = "-";

    blastDestUl.appendChild(blastDestLi);
    blastDestDiv.appendChild(blastDestUl);
    blastDestDiv.appendChild(blastDestAdd);
    blastDestDiv.appendChild(blastDestRemove);

    document.getElementById('gc_blast').appendChild(blastDestDiv);

    var blastDestAddBtn = document.getElementById('add_blast_dest');
    blastDestAddBtn.addEventListener('click', App.addBlastDest);
    var blastDestRemoveBtn = document.getElementById('remove_blast_dest');
    blastDestRemoveBtn.addEventListener('click', App.removeBlastDest);

    // Blast Messages
    var blastKeyDiv = document.createElement('div');
    blastKeyDiv.id = "gc_blast_keys";
    var blastKeyUl = document.createElement('ul');
    var blastKeyLi = document.createElement('li');
    var blastKeyLiText = document.createTextNode('Key: ');
    var blastKeyLiInput = document.createElement('input');
    blastKeyLiInput.type = "text";
    blastKeyLiInput.maxlength = "100";
    blastKeyLiInput.className = "blast_key";
    blastKeyLiInput.id = "blast_key";
    blastKeyLiInput.placeholder = "Msg ID (e.g. MK1234)...";
    blastKeyLi.appendChild(blastKeyLiText);
    blastKeyLi.appendChild(blastKeyLiInput);

    var blastKeyAdd = document.createElement('button');
    blastKeyAdd.id = "add_blast_key";
    blastKeyAdd.innerHTML = "+";
    var blastKeyRemove = document.createElement('button');
    blastKeyRemove.id = "remove_blast_key";
    blastKeyRemove.innerHTML = "-";

    blastKeyUl.appendChild(blastKeyLi);
    blastKeyDiv.appendChild(blastKeyUl);
    blastKeyDiv.appendChild(blastKeyAdd);
    blastKeyDiv.appendChild(blastKeyRemove);

    document.getElementById('gc_blast').appendChild(blastKeyDiv);

    var blastKeyAddBtn = document.getElementById('add_blast_key');
    blastKeyAddBtn.addEventListener('click', App.addBlastKey);
    var blastKeyRemoveBtn = document.getElementById('remove_blast_key');
    blastKeyRemoveBtn.addEventListener('click', App.removeBlastKey);

    // Blast Button

    var blastButtonDiv = document.createElement('div');
    var blastButtonDivBreak = document.createElement('br');
    var blastButton = document.createElement('button');
    blastButton.className = "vm_blast";
    blastButton.id = "vm_blast_" + interestId;
    blastButton.innerHTML = "Blast";

    blastButtonDiv.appendChild(blastButtonDivBreak);
    blastButtonDiv.appendChild(blastButton);

    document.getElementById('gc_blast').appendChild(blastButtonDiv);

    var blastButtonBtn = document.getElementById('vm_blast_' + interestId);
    blastButtonBtn.addEventListener('click', App.blast);
}

App.getFeatures = function(e) {
    e.preventDefault();
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_get_features_', '');
    }
    if (e.target.dataset.device) {
        var device = e.target.dataset.device;
    }
    getFeaturesClick(profileId, device);
};

function getFeaturesClick(profileId, device) {
    var system = (device === 'vmstsp'? getVMSSystem() : getDefaultSystem());
    Session.connection.openlink.getFeatures(system, profileId, function(features) {
        var featuresUl = document.createElement('ul');
        var featuresDiv = document.createElement('div');
        featuresDiv.id = "profile_" + profileId;
        var featuresLi = document.createElement('li');
        var featuresText = document.createTextNode(profileId);
        var featureUl = document.createElement('ul');

        featuresLi.appendChild(featuresText);
        featuresLi.appendChild(featureUl);
        featuresDiv.appendChild(featuresLi);
        featuresUl.appendChild(featuresDiv);
        document.getElementById('gc_feature_list').appendChild(featuresUl);

        var featureProfileUl = document.getElementById('profile_' + profileId).getElementsByTagName('ul');

        for (var elem in features) {
            var featureLi = document.createElement('li');
            var featureText = document.createTextNode(features[elem].id + ' - '
                + features[elem].type + ' - '
                + features[elem].label);
            featureLi.appendChild(featureText);
            if (features[elem].id.indexOf('MK') > -1) {
                var featurePlaybackSpan = document.createElement('span');
                featurePlaybackSpan.innerHTML = " - ";
                var featurePlaybackBtn = document.createElement('a');
                featurePlaybackBtn.href = "#";
                featurePlaybackBtn.className = "gc_feature_playback";
                featurePlaybackBtn.id = "gc_feature_playback_" + profileId + "_" + features[elem].id;
                featurePlaybackBtn.innerHTML = "Playback";
                var featurePlaybackNumberDiv = document.createElement('div');
                featurePlaybackNumberDiv.id = "playback_number_" + features[elem].id;
                featureLi.appendChild(featurePlaybackSpan);
                featureLi.appendChild(featurePlaybackBtn);
                featureLi.appendChild(featurePlaybackNumberDiv);
            }
            featureProfileUl[0].appendChild(featureLi);

            if (features[elem].id.indexOf('MK') > -1) {
                var getPlaybackBtn = document.getElementById('gc_feature_playback_' + profileId + '_' + features[elem].id);
                getPlaybackBtn.addEventListener('click', App.playback);
            }
        }

    }, function(message) {
        console.log("ALERT:",message);
    });
}

App.subscribe = function(e) {
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
};

App.unsubscribe = function(e) {
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
};

App.makeCall = function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interestCoded = e.target.id.replace('gc_makecall_interest_', '');
        var interest = e.target.id.replace('gc_makecall_interest_', '');
        interest = decodeURIComponent(interest);
    }
    var system = (interest.indexOf('vmstsp') > -1? getVMSSystem() : getDefaultSystem());
    var dest = document.getElementById("makecall_extension_" + interestCoded).value;
    Session.connection.openlink.makeCall(system, interest, dest,
        [
            // { id: 'Conference', value1: false },
            // { id: 'CallBack', value1: true }
        ], function(call) {
            console.log("ALERT:",'Call made with id: ' + call.id);
        },function(message) {
            console.log("ALERT:",message);
        });
};

App.makeCallConf = function(e) {
    e.preventDefault();
    if (e.target.id) {
        var interest = e.target.id.replace('gc_makecall_interest_conf_', '');
    }
    var system = (interest.indexOf('vmstsp') > -1? getVMSSystem() : getDefaultSystem());
    var dest = document.getElementById("makecall_extension_" + interestCoded).value;
    Session.connection.openlink.makeCall(system, interest, dest,
        [
            { id: 'Conference', value1: true },
            { id: 'CallBack', value1: true }
        ], function(call) {
            console.log("ALERT:",'Call made with id: ' + call.id);
        },function(message) {
            console.log("ALERT:",message);
        });
};

App.requestAction = function() {
    var callId = document.getElementById('request_action_callid').value;
    var actionId = document.getElementById('request_action_actionid').value;
    var value1 = document.getElementById('request_action_value1').value;
    var value2 = document.getElementById('request_action_value2').value;
    var call = Session.connection.openlink.calls[callId];
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
};

var requestActionButton = document.getElementById('gc_request_action');
requestActionButton.addEventListener('click', App.requestAction);

App.getCallHistory = function() {
    document.getElementById('gc_history_list').innerHTML = "";
    var ulElement = document.createElement('ul');
    var liElement = document.createElement('li');
    var liText = document.createTextNode('Loading History');
    liElement.appendChild(liText);
    ulElement.appendChild(liElement);
    document.getElementById('gc_history_list').appendChild(ulElement);

    Session.connection.openlink.getCallHistory(getDefaultSystem(), "", 
        "", "", "", "incoming", "", "", "", "5", function(history) {
        document.getElementById('gc_history_list').innerHTML = "";
        var historyListUl = document.createElement('ul');
        if (history) {
            console.log(history);
        } else {
            return;
        }

        for (var callid in history) {
            var call = history[callid];

            var historyText = document.createTextNode(call.id);
            var historyUl = document.createElement('ul');

            for (var property in call) {
                var historyPropertyLi = document.createElement('li');
                var historyPropertyText = document.createTextNode(property + ': ' + call[property]);

                historyPropertyLi.appendChild(historyPropertyText);
                historyUl.appendChild(historyPropertyLi);
            }

            historyListUl.appendChild(historyText);
            historyListUl.appendChild(historyUl);
        }
        document.getElementById('gc_history_list').appendChild(historyListUl);

    },function(message) {
        console.log("ALERT:",message);
    });
};

var getCallHistoryButton = document.getElementById('gc_get_history');
getCallHistoryButton.addEventListener('click', App.getCallHistory);

// VMS stuff
App.record = function(e) {
    e.preventDefault();
    console.log('Requesting record');
    if (e.target.id) {
        var profileId = e.target.id.replace('gc_record_', '');
        var label = document.getElementById('record_label_' + profileId).value;
    }
    Session.connection.openlink.manageVoiceMessageRecord(getVMSSystem(), profileId, label, function(recordFeatures) {
        console.log(recordFeatures);
        var recordingNumber = document.getElementById('recording_number');
        recordingNumber.innerHTML = ' Record extension: ' + recordFeatures.exten;
    }, function(message) {
        console.log("ALERT:",message);
    });
};

App.playback = function(e) {
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
        var playbackNumber = document.getElementById('playback_number_' + feature);
        playbackNumber.innerHTML = ' Playback extension: ' + playbackFeatures.exten;
    }, function(message) {
        console.log("ALERT:",message);
    });
};

App.addBlastDest = function(e) {
    e.preventDefault();
    var blastDestLi = document.createElement('li');
    var blastDestLiText = document.createTextNode('Dest: ');
    var blastDestLiInput = document.createElement('input');
    blastDestLiInput.type = "text";
    blastDestLiInput.maxlength = "100";
    blastDestLiInput.className = "blast_dest";
    blastDestLiInput.id = "blast_dest";
    blastDestLiInput.placeholder = "Destination...";
    blastDestLi.appendChild(blastDestLiText);
    blastDestLi.appendChild(blastDestLiInput);
    var blastDestUl = document.getElementById('gc_blast_dests').getElementsByTagName('ul');
    blastDestUl[0].appendChild(blastDestLi);
};

App.removeBlastDest = function(e) {
    e.preventDefault();
    var blastDestDiv = document.getElementById('gc_blast_dests');
    var blastDestUl = blastDestDiv.getElementsByTagName('ul');
    var blastDestUlLength = blastDestUl.length;
    if (blastDestUl[0].hasChildNodes()) {
        blastDestUl[0].removeChild(blastDestUl[0].childNodes[blastDestUlLength - 1]);        
    }
};

App.addBlastKey = function(e) {
    e.preventDefault();
    var blastKeyLi = document.createElement('li');
    var blastKeyLiText = document.createTextNode('Key: ');
    var blastKeyLiInput = document.createElement('input');
    blastKeyLiInput.type = "text";
    blastKeyLiInput.maxlength = "100";
    blastKeyLiInput.className = "blast_key";
    blastKeyLiInput.id = "blast_key";
    blastKeyLiInput.placeholder = "Msg ID (e.g. MK1234)...";
    blastKeyLi.appendChild(blastKeyLiText);
    blastKeyLi.appendChild(blastKeyLiInput);
    var blastKeyUl = document.getElementById('gc_blast_keys').getElementsByTagName('ul');
    blastKeyUl[0].appendChild(blastKeyLi);
};

App.removeBlastKey = function(e) {
    e.preventDefault();
    var blastkeyDiv = document.getElementById('gc_blast_keys');
    var blastKeyUl = blastkeyDiv.getElementsByTagName('ul');
    var blastKeyUlLength = blastKeyUl.length;
    if (blastKeyUl[0].hasChildNodes()) {
        blastKeyUl[0].removeChild(blastKeyUl[0].childNodes[blastKeyUlLength - 1]);        
    }
};

App.blast = function(e) {
    e.preventDefault();

    var dests = document.getElementsByClassName('blast_dest');
    var destsToBlast = [];

    for (var i = 0; i < dests.length; i++) {
        if (dests[i].value) {
            destsToBlast.push(dests[i].value);
        }
    }

    var keys = document.getElementsByClassName('blast_key');
    var keysToBlast = [];

    for (var i = 0; i < keys.length; i++) {
        if (keys[i].value) {
            keysToBlast.push(keys[i].value);
        }
    }

    var interestId = e.target.id.replace('vm_blast_', '');
    var profileId = interestId.split('_vmstsp')[0];
    var offset = "0";
    Session.connection.openlink.manageVoiceBlast(getVMSSystem(), profileId, interestId, keysToBlast, destsToBlast, offset, function(iq) {
        console.log(iq);
    }, function(message) {
        console.log("ALERT:",message);
    });
};

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


