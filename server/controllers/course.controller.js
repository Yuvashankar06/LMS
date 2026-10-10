import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMedia, deleteVideo, uploadMedia } from "../utils/cloudinary.js";


export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course Title and Category are required"
            })
        }
        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        });
        return res.status(201).json({
            course,
            message: "Course Created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

// export const searchCourse = async(req,res)=>{
//     try {
//         const {query="",categories=[],sortByPrice=""} =req.query;
        
//         const searchCriteria = {
//             isPublished : true,
//             $or :[
//                 {courseTitle:{$regex:query,$options:"i"}},
//                 {subTitle:{$regex:query,$options:"i"}},
//                 {category:{$regex:query,$options:"i"}}
//             ]
//         }
//         // if category selected 
//         if(categories.length > 0){
//             searchCriteria.category = {$in:categories}
//         }

//         // define sorting order
//         const sortOptions = {};
//         if(sortByPrice === "low"){
//             sortOptions.coursePrice = 1; // sort by price in ascending order
//         }else if(sortByPrice === "high"){
//             sortOptions.coursePrice = -1;
//         }

//         let courses =await Course.find(searchCriteria).populate({path:"creator",select:"name photoUrl"}).sort(sortOptions);
//         return res.status(200).json({
//            success:true,
//            courses:courses || []
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "Failed to search course"
//         })
//     }
// }

export const searchCourse = async (req, res) => {
  try {
    let { query = "", categories = [], sortByPrice = "" } = req.query;

    if (typeof categories === "string") {
      categories = categories.split(",").map((c) => c.trim());
    }

    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1;
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1;
    }

    const courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to search course",
    });
  }
};


export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({ creator: userId })
        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course Not Found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Get course"
        })
    }
}

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        const thummbnail = req.file;
        let course = await Course.findById(courseId);
        if (!courseId) {
            return res.status(404).json({
                message: "Course Not Found"
            })
        }
        let courseThumbnail;
        if (thummbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMedia(publicId);// delete old image
            }
            // upload thumbnail on clodinary
            courseThumbnail = await uploadMedia(thummbnail.path);
        }

        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url }
        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            course,
            message: "Course Updated Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Edit course"
        })
    }
}

export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course Not Found"
            })
        }
        return res.status(200).json({
            course,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id"
        });
    }
}

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture Title is required"
            });
        }

        //create Lecture
        const lecture = await Lecture.create({ lectureTitle });
        const course = await Course.findById(courseId);
        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(201).json({
            lecture,
            message: "Lecture Created Successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create lecture"
        });
    }
}

export const getLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "Course Not Found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Get lecture"
        });

    }
}
// export const getLecture = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const course = await Course.findById(courseId).populate("lectures");
//     if (!course) {
//       return res.status(404).json({
//         message: "Course not found",
//       });
//     }
//     return res.status(200).json({
//       lectures: course.lectures,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Failed to get lectures",
//     });
//   }
// };


export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture Not Found"
            })
        }
        // update lecture
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();
        // Ensure the course still has the lecture id if it was not already added
        const course = await Course.findById(courseId);
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message: "Lecture updated Successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Edit lecture"
        });
    }
}

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture Not Found"
            });
        }
        // delete from cloudinary as well
        if (lecture.publicId) {
            await deleteVideo(lecture.publicId);
        }

        // Remove the lecture reference from te associated course
        await Course.updateOne(
            {lectures: lectureId},
            {$pull:{lectures:lectureId}} // Remove the lecture id from the lectures array
        );
        return res.status(200).json({
            message:"Lecture Removed Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Remove lecture"
        });
    }
}

export const getLectureById = async(req,res)=>{
    try {
        const {lectureId}=req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture Not Found"
            });
        }
        return res.status(200).json({
            lecture
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lecture by id"
        });
        
    }
}


// publish unpublish course logic

export const togglePublishCourse = async(req,res)=>{
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true or false
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course Not Found"
            });
        }
        //publish status based on query parameter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update Status"
        });
    }
}

export const getPublishedCourse = async(_,res)=>{
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator",select:"name photoUrl"});
        if(!courses){
            res.status(404).json({
                message:"Course Not Found"
            })
        }
        res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to Get Published Courses"
        });
    }
}