// Generated by CoffeeScript 1.3.1
(function() {
  var NoteRain,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  NoteRain = (function() {

    NoteRain.name = 'NoteRain';

    NoteRain.prototype.lengthScale = 0.001;

    function NoteRain(pianoDesign) {
      this.pianoDesign = pianoDesign;
      this.update = __bind(this.update, this);

      this.model = new THREE.Object3D();
      this.noteToColor = (function() {
        var map, offset;
        map = MusicTheory.Synesthesia.map('August Aeppli (1940)');
        offset = MIDI.pianoKeyOffset;
        return function(note) {
          return parseInt(map[note - offset].hex, 16);
        };
      })();
    }

    NoteRain.prototype.bind = function(eventName, callback) {
      return this["on" + eventName] = callback;
    };

    NoteRain.prototype.setMidiData = function(midiData, callback) {
      var noteInfos;
      this.clear();
      noteInfos = this._getNoteInfos(midiData);
      return this._buildNoteMeshes(noteInfos, callback);
    };

    NoteRain.prototype.clear = function() {
      var child, _i, _len, _ref, _results;
      _ref = this.model.children.slice(0);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this.model.remove(child));
      }
      return _results;
    };

    NoteRain.prototype._getNoteInfos = function(midiData) {
      var currentTime, duration, event, interval, noteInfos, noteNumber, noteTimes, startTime, subtype, _i, _len, _ref, _ref1;
      currentTime = 0;
      noteInfos = [];
      noteTimes = [];
      for (_i = 0, _len = midiData.length; _i < _len; _i++) {
        _ref = midiData[_i], (_ref1 = _ref[0], event = _ref1.event), interval = _ref[1];
        currentTime += interval;
        subtype = event.subtype, noteNumber = event.noteNumber;
        if (subtype === 'noteOn') {
          noteTimes[noteNumber] = currentTime;
        } else if (subtype === 'noteOff') {
          startTime = noteTimes[noteNumber];
          duration = currentTime - startTime;
          noteInfos.push({
            noteNumber: noteNumber,
            startTime: startTime,
            duration: duration
          });
        }
      }
      return noteInfos;
    };

    NoteRain.prototype._buildNoteMeshes = function(noteInfos, callback) {
      var Black, KeyType, SIZE_OF_EACH_GROUP, blackKeyHeight, blackKeyWidth, group, groups, keyInfo, sleepTask, splitToGroups, tasks, _i, _len, _ref,
        _this = this;
      _ref = this.pianoDesign, blackKeyWidth = _ref.blackKeyWidth, blackKeyHeight = _ref.blackKeyHeight, keyInfo = _ref.keyInfo, KeyType = _ref.KeyType;
      Black = KeyType.Black;
      splitToGroups = function(items, sizeOfEachGroup) {
        var groups, i, numGroups, start, _i;
        groups = [];
        numGroups = Math.floor(items.length / sizeOfEachGroup);
        start = 0;
        for (i = _i = 0; 0 <= numGroups ? _i < numGroups : _i > numGroups; i = 0 <= numGroups ? ++_i : --_i) {
          groups[i] = items.slice(start, start + sizeOfEachGroup);
          start += sizeOfEachGroup;
        }
        return groups;
      };
      sleepTask = function(done) {
        return setTimeout(done, 0);
      };
      tasks = [];
      SIZE_OF_EACH_GROUP = 100;
      groups = splitToGroups(noteInfos, SIZE_OF_EACH_GROUP);
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        tasks.push(sleepTask);
        tasks.push((function(group) {
          return function(done) {
            var color, duration, geometry, length, material, mesh, noteInfo, noteNumber, startTime, x, y, z, _j, _len1;
            for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
              noteInfo = group[_j];
              noteNumber = noteInfo.noteNumber, startTime = noteInfo.startTime, duration = noteInfo.duration;
              length = duration * _this.lengthScale;
              x = keyInfo[noteNumber].keyCenterPosX;
              y = startTime * _this.lengthScale + (length / 2);
              z = -0.2;
              if (keyInfo[noteNumber].keyType === Black) {
                y += blackKeyHeight / 2;
              }
              color = _this.noteToColor(noteNumber);
              geometry = new THREE.CubeGeometry(blackKeyWidth, length, blackKeyWidth);
              material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                opacity: 0.7,
                transparent: true
              });
              mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(x, y, z);
              _this.model.add(mesh);
            }
            return done();
          };
        })(group));
      }
      return async.series(tasks, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    NoteRain.prototype.update = function(playerCurrentTime) {
      return this.model.position.y = -playerCurrentTime * this.lengthScale;
    };

    return NoteRain;

  })();

  this.NoteRain = NoteRain;

}).call(this);
