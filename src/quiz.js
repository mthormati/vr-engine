const dependencies = require('./dependencies')
const Util = require('./util')
const $ = dependencies.jquery

const QuizController = {

    getQuiz(callback) {
        callback({
            question: "What's a computer?",
            answers: {
                0: 'It depends',
                1: 'Some of the above',
                2: 'None of the above',
                3: 'All of the above'
            }
        })
    },

    generateText(quiz) {
        let text = quiz.question
        let ansLetterASCII = 97;
        Object.keys(quiz.answers).forEach((index) => {
            text += '\n'
            text += String.fromCharCode(ansLetterASCII)
            text += '.) '
            text += quiz.answers[index]
            ansLetterASCII++;
        })
        return text
    },

    generateEntity(quiz) {
        const numAnswers = Object.keys(quiz.answers).length
        const leftmostPos = -6*((numAnswers/2) - 1) - 3
        const entity = $('<a-entity id="quiz"></a-entity>')
        let entitySrc = `
            <a-text value="${this.generateText(quiz)}" align="left" width="40" position="${leftmostPos} 16 0"></a-text>
        `
        let ansLetterASCII = 65;
        let currentPos = leftmostPos
        Object.keys(quiz.answers).forEach((index) => {
            const ansLetter = String.fromCharCode(ansLetterASCII)
            const ansCircle = `
                <a-circle id="ans-${ansLetter}" position="${currentPos} 6 0" rotation="0 0 0" radius="2" color="${Util.colorForIndex(index)}" cursor-listener>
                    <a-text value="${ansLetter}" width="50" align="center">
                </a-circle>
            `
            entitySrc += ansCircle
            currentPos += 6
            ansLetterASCII++
        })
        entity.html(entitySrc)
        return entity
    }

}

module.exports = QuizController

AFRAME.registerComponent('cursor-listener', {
    init: function () {
      var lastIndex = -1;
      var COLORS = ['red', 'green', 'blue'];
      this.el.addEventListener('click', function (evt) {
        lastIndex = (lastIndex + 1) % COLORS.length;
        this.setAttribute('material', 'color', COLORS[lastIndex]);
        console.log('I was clicked at: ', evt.detail.intersection.point);
      });
    }
  });