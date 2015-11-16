// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}



Players = new Mongo.Collection("players");
Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
    Session.set("uid",getRandom(100,10000000));
    Template.leaderboard.helpers({
        players: function () {
            return Players.find({}, { sort: { score: -1, name: 1 } });
        },
        selectedName: function () {
            var player = Players.findOne(Session.get("selectedPlayer"));
            return player && player.name;
        }
    });
    Template.messages.helpers({
        messages: function () {
            var d = Messages.find({}, {});
            return d.map(function(m){
                return {text: m.text, ismy: (m.uid==Session.get("uid"))};
            })
        }
    });
    Template.leaderboard.events({
        'click .inc': function () {
            Players.update(Session.get("selectedPlayer"), {$inc: {score: 5}});
        }
    });

    Template.player.helpers({
        selected: function () {
            return Session.equals("selectedPlayer", this._id) ? "selected" : '';
        }
    });

    Template.player.events({
        'click': function () {
            Session.set("selectedPlayer", this._id);
        }
    });

    Template.editor.events({
        'click #send_msg': function () {
            sendMessage( document.getElementById("editor_msg").value);
            document.getElementById("editor_msg").value = "";
        },
        'keyup #editor_msg': function (e) {
            console.log(e);
            if (e.keyCode == 13 && !(e.shiftKey || e.altKey || e.ctrlKey)) {
                sendMessage( document.getElementById("editor_msg").value);
                document.getElementById("editor_msg").value = "";
            }
        }
    });

    function sendMessage(msg){
        msg = msg.trim();
        if(msg!="") {
            Messages.insert({
                uid: Session.get("uid"),
                text: msg
            });
        }
    }


    function clearMessages(){
        Messages.remove({});
    }
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {

    //Messages.remove({});

    Meteor.startup(function () {
        if (Players.find().count() === 0) {
            var names = ["Vlad","Max"];
            var id = 0;
            _.each(names, function (name) {
                id++;
                Players.insert({
                    name: name,
                    uid:id
                });
            });
        }
        if (Messages.find().count() === 0) {

            Messages.insert({
                uid: 0,
                text: "Добро пожаловать в GCQ"
            });

        }
    });
}
