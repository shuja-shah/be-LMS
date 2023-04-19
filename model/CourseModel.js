const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
});

const courseSchema = mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    courseThumbnail: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    teacherType: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Number,
      default: 0,
    },
    lessons: [lessonSchema], // Optional nested array of lessons
  },
  {
    timestamps: true,
  }
);

const CourseModel = mongoose.model("Course", courseSchema);

module.exports = CourseModel;
