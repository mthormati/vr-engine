const GetURLParam = require('get-url-param')
const Firebase = require('firebase')
const Secrets = require('./secrets')

const DataController = {
    intializeFirebase() {
        this.getLectureIDFromURL()
        this.getCourseIDFromURL()
        Firebase.initializeApp(Secrets.firebaseConfig)
        this.database = Firebase.database()
    },

    writeTestLecture() {
        const lectureId = this.database.ref('Courses/hesgotapumpee/lectures/').push().key;
        this.database.ref('Courses/hesgotapumpee/lectures/').set({
            title: "How to browse the web with emacs",
            course: "hesgotapumpee",
            date : Date.now(),
            sky: "default",
            timeline: {
                firstVideo: {
                    id: "abc123",
                    lecture: "5678",
                    type: "video",
                    eventTime: 0,
                    resource: 'https://vyden.nyc3.digitaloceanspaces.com/videos/Why%20Alien%20Life%20Would%20be%20our%20Doom%20-%20The%20Great%20Filter.mp4',
                },
                thenQuiz: {
                    id: "abc123",
                    lecture: "5678",
                    type: "quiz",
                    eventTime: 10000,
                    quizTime: 10000,
                    resource: 'kurzquiz1',
                },
                finishVideo: {
                    id: "abc123",
                    lecture: "5678",
                    type: "video",
                    eventTime: 20000,
                    resource: 'https://vyden.nyc3.digitaloceanspaces.com/videos/Why%20Alien%20Life%20Would%20be%20our%20Doom%20-%20The%20Great%20Filter.mp4',
                }
            },

        });
    },

    getLectureIDFromURL() {
        this.lectureID = GetURLParam(window.location.href,'lecture')
    },

    getCourseIDFromURL() {
        this.courseID = GetURLParam(window.location.href,'course')
    },

    getTimelineFromFirebase(callback) {
        if(this.lectureID === 'test') {
            const timeline = [{
                id: "abc123",
                lecture: "5678",
                type: "video",
                eventTime: 0,
                resource: 'https://vyden.nyc3.digitaloceanspaces.com/videos/33c685f7-3a35-4af8-adde-d13024e2c004',
            },
            {
                id: "abc123",
                lecture: "5678",
                type: "quiz",
                eventTime: 10000,
                quizTime: 10000,
                resource: 'test',
            },
            {
                id: "abc123",
                lecture: "5678",
                type: "video",
                eventTime: 20000,
                resource: 'https://vyden.nyc3.digitaloceanspaces.com/videos/33c685f7-3a35-4af8-adde-d13024e2c004',
            }]
            return callback(timeline)
        }
        this.database.ref('/Courses/' + this.courseID + '/lectures/' + this.lectureID).once('value').then(function(snapshot) {
            const lecture = snapshot.val()
            let timeline = []
            Object.keys(lecture.timeline).forEach((key) => {
                lecture.timeline[key].eventTime *= 1000
                timeline.push(lecture.timeline[key])
            })
            callback(timeline)
        })
    },

    getQuizFromTimelineItem(timelineItem,callback) {
        if(timelineItem.resource === 'test') {
            //return fake quiz
            return callback({
                question: "Is JavaScript a good language?",
                answers: ["Yes", "No"],
                time: 10000
            })
        }
        this.database.ref('/Courses/' + this.courseID + '/quizzes/' + timelineItem.resource + '/').once('value').then(function(snapshot) {
            console.log("the quiz id:",timelineItem.resource)
            const quiz = snapshot.val()
            quiz.time = parseInt(quiz.time) * 1000
            console.log("about to send quiz",quiz)
            callback(quiz)
        })
    },

    submitAnswerForQuiz(quizID,answer) {
        const responseID = this.database.ref('Courses/' + this.courseID +'/lectures/lectureQuizResponses/' + this.lectureID).push().key
        this.database.ref('Courses/' + this.courseID + '/lectureQuizResponses/' + this.lectureID + '/' + responseID).set({
            id: responseID,
            selection: answer,
            date: Date.now(),
            quiz: quizID
        })
    }
}

module.exports = DataController