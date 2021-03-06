const dependencies = require('./dependencies')
const Util = require('./util')
const Stage = require('./stage')
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
                <a-circle id="ans-${ansLetter}" data-ans="${index}" position="${currentPos} 8 0" rotation="0 0 0" radius="2" color="${Util.colorForIndex(index)}" ${Util.isMobile() ? "" : "mouse-cursor"} cursor-listener
                event-set__enter="_event: mouseenter; scale: 1.25 1.25 1.25"
                event-set__leave="_event: mouseleave; scale: 1 1 1"f
                >
                    <a-text value="${ansLetter}" width="50" align="center">
                </a-circle>
            `
            entitySrc += ansCircle
            currentPos += 6
            ansLetterASCII++
        })
        entity.html(entitySrc)
        return entity
    },

    generateSubmitAnimation(ansLetter) {
        const circle = $(`#ans-${ansLetter}`)
        console.log('circle letter',ansLetter)
        const pos = circle.attr('position')
        const animation = `
            <a-animation attribute="position" dur="1500" from="${pos.x} ${pos.y} ${pos.z}" to="${pos.x} 50 ${pos.z}"></a-animation>
        `
        const animationEl = $(animation)
        circle.append(animationEl)
    },

    controlQuiz(scene) {
        this.scene = scene
        this.quiz = scene.currentItem.quiz
        console.log("control quiz:",this.quiz)
        this.timeout = setTimeout(function() {
            //scene.presentNext()
            console.log("timeout reached")
            this.finishQuiz()
        }.bind(this),this.quiz.time)
    },

    finishQuiz() {
        const video = document.getElementById('video')
        if((video.duration - video.currentTime) > 1 && this.scene.timeline.length == 0) {
            this.scene.timeline.push({
                id: "tempVideo",
                type: "video",
                resource: this.scene.videoURL
            })
        }
        $('#mobileCursor').remove()
        console.log("remaining timeline",this.scene.timeline)
        this.scene.presentNext()
    },

    submitAnswer(index,element) {
        if(this.answer) return
        this.answer = index;
        clearTimeout(this.timeout)
        let ansLetterASCII = 65 + index;
        const ansLetter = String.fromCharCode(ansLetterASCII)
        this.generateSubmitAnimation(ansLetter)
        setTimeout(function() {
            this.finishQuiz()
        }.bind(this),2000)
        console.log("submit index: " + index)
        console.log("this scene",this.scene)
        console.log("resource",this.scene.currentItem.resource)
        this.scene.DataController.submitAnswerForQuiz(this.scene.currentItem.resource,index)
        //send over to firebase
    }

}

module.exports = QuizController

AFRAME.registerComponent('cursor-listener', {
    init: function () {
      //var lastIndex = -1;
      //var COLORS = ['red', 'green', 'blue'];
      this.el.addEventListener('click', function (event) {
        // lastIndex = (lastIndex + 1) % COLORS.length;
        // this.setAttribute('material', 'color', COLORS[lastIndex]);
        const quiz = document.currentScene.currentItem
        console.log("ans " + event.target.dataset.ans)
        quiz.controller.submitAnswer(parseInt(event.target.dataset.ans),this.el)
        console.log(document.currentScene.currentItem)
      });
    //   this.el.addEventListener('mouseenter', function (event) {
    //     console.log("mouse enter!")
    //     lastIndex = (lastIndex + 1) % COLORS.length;
    //     this.setAttribute('material', 'color', COLORS[lastIndex]);
    //   });
    }
  });