const Beam = require('beam-client-node');
const Interactive = require('beam-interactive-node');
const rjs = require('robotjs');

const channelId = 235212;
const username = 'Jolinar';
const password = 'BeamTrustno1@';

const beam = new Beam();

beam.use('password', {
  username,
  password,
})
.attempt()
.then(() => beam.game.join(channelId))
.then(res => createRobot(res))
.then(robot => performRobotHandShake(robot))
.then(robot => setupRobotEvents(robot))
.catch(err => {
  if (err.res) {
    throw new Error('Error connecting to Interactive:' + err.res.body.mesage);
  }
  throw new Error('Error connecting to Interactive', err);
});

function createRobot (res) {
  return new Interactive.Robot({
    remote: res.body.address,
    channel: channelId,
    key: res.body.key,
  });
}

function performRobotHandShake (robot) {
  return new Promise((resolve, reject) => {
    robot.handshake(err => {
      if (err) {
        reject(err);
      }
      resolve(robot);
    });
  });
}

function setupRobotEvents (robot) {
  robot.on('report', report => {
    const mouse = rjs.getMousePos();
    if (report.joystick.length > 0) {
      const mean = report.joystick[0].coordMean;
      if (!isNaN(mean.x) && !isNaN(mean.y)) {
        rjs.moveMouse(Math.round(mouse.x + 300 * mean.x), Math.round(mouse.y + 300 * mean.y));
      }
    }
    for (var i = 0; i < report.tactile.length; i ++) {
      if (report.tactile[i].holding === 1) {
        switch(report.tactile[i].id) {
          case 0: //W
            mouse.y -= 300;
            break;
          case 2: //A
            mouse.x -= 300;
            break;
          case 3: //S
            mouse.y += 300;
            break;
          case 4: //D
            mouse.x += 300;
            break;
        }
        rjs.moveMouse(Math.round(mouse.x), Math.round(mouse.y));
      }
    }
  });
  robot.on('error', err => {
    throw new Error('There was an error in the Interactive connection', err);
  });
}
