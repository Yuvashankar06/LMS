import express from 'express';
import isAuthenticated from './../middleware/isAuthenticated.js';
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getCourseById,
  getCreatorCourses,
  getLecture,
  getLectureById,
  getPublishedCourse,
  removeLecture,
  searchCourse,
  togglePublishCourse
} from '../controllers/course.controller.js';
import upload from '../utils/multer.js';

const router = express.Router();

// Create a course
router.post("/", isAuthenticated, createCourse);
router.get("/search",isAuthenticated,searchCourse);

router.get("/published-courses",getPublishedCourse);
// Get all courses created by the authenticated user
router.get("/", isAuthenticated, getCreatorCourses);
// Edit a course by ID, including file upload
router.put("/:courseId", isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.get("/:courseId",isAuthenticated,getCourseById);
router.post("/:courseId/lecture",isAuthenticated,createLecture);
router.get("/:courseId/lecture",isAuthenticated,getLecture);
router.post("/:courseId/lecture/:lectureId",isAuthenticated,editLecture);
router.delete("/lecture/:lectureId",isAuthenticated,removeLecture);
router.get("/lecture/:lectureId",isAuthenticated,getLectureById);
router.patch("/:courseId",isAuthenticated,togglePublishCourse);


export default router;
