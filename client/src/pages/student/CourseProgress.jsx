import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();

  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();


   const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <p>Failed to load</p>;

  // console.log(data);
  const normalizedData = data.data ? data.data : data;
  const { courseDetails, progress, completed } = normalizedData;

  // const { courseDetails, progress, completed } = data;
  const { courseTitle } = courseDetails;

  // initialize the first lecture is not exist
  const initialLecture = currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  // Handle select a specific lecture

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  // Handle select a specific lecture
  const handleSelectLecture=(lecture)=>{
    setCurrentLecture(lecture);
    // handleLectureProgress(lecture._id);
  }

  const handleCompleteCourse = async () => {
  try {
    const res = await completeCourse(courseId).unwrap();
    toast.success(res.message || "Course marked complete");
    refetch();
  } catch (New) {
    toast.error("Failed to complete course");
  }
};

const handleInCompleteCourse = async () => {
  try {
    const res = await inCompleteCourse(courseId).unwrap();
    toast.success(res.message || "Course marked incomplete");
    refetch();
  } catch (errorNn) {
    toast.error("Failed to mark course as incomplete");
  }
};

  return (
    <div className="max-w-7xl mx-auto p-4 mt-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          variant={completed ? "outline" : "default"}
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Completed</span>
            </div>
          ) : (
            "Mark as Completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            <video
              src={currentLecture?.videoUrl || initialLecture.videoUrl}
              controls
              className="w-full h-auto md:rounded-lg"
              onEnded={() =>
                handleLectureProgress(currentLecture?._id || initialLecture._id)
              }
            />
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex(
                  (lec) =>
                    lec._id === (currentLecture?._id || initialLecture._id)
                ) + 1
              } : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              } `}
            </h3>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails.lectures.map((lecture, index) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-200"
                    : "dark:bg-gray-800"
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center p-0">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text=lg font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-200 text-green-600 "
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardTitle } from "@/components/ui/card";
// import {
//   useCompleteCourseMutation,
//   useGetCourseProgressQuery,
//   useInCompleteCourseMutation,
//   useUpdateLectureProgressMutation,
// } from "@/features/api/courseProgressApi";
// import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { toast } from "sonner";

// const CourseProgress = () => {
//   const [currentLecture, setCurrentLecture] = useState(null);
//   const params = useParams();
//   const courseId = params.courseId;

//   const { data, isLoading, isError, refetch } =
//     useGetCourseProgressQuery(courseId);
//   const [updateLectureProgress] = useUpdateLectureProgressMutation();
//   const [
//     completeCourse,
//     { data: markCompleteData, isSuccess: completedSuccess },
//   ] = useCompleteCourseMutation();
//   const [
//     inCompleteCourse,
//     { data: markInCompleteData, isSuccess: inCompletedSuccess },
//   ] = useInCompleteCourseMutation();

//   // Logging for debugging
//   console.log("Fetched data:", data);
//   console.log("Current Lecture:", currentLecture);

//   useEffect(() => {
//     if (data?.courseDetails?.lectures?.length) {
//       setCurrentLecture(data.courseDetails.lectures[0]);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (completedSuccess && markCompleteData?.message) {
//       toast.success(markCompleteData.message);
//     }
//   }, [completedSuccess, markCompleteData]);

//   useEffect(() => {
//     if (inCompletedSuccess && markInCompleteData?.message) {
//       toast.success(markInCompleteData.message);
//     }
//   }, [inCompletedSuccess, markInCompleteData]);

//   if (isLoading) return <h1>Loading...</h1>;
//   if (isError || !data?.courseDetails) return <p>Failed to load course</p>;

//   const { courseDetails, progress, completed } = data;

//   if (!courseDetails?.lectures?.length) {
//     return <p>No lectures available for this course.</p>;
//   }

//   const isLectureCompleted = (lectureId) =>
//     progress?.some((prog) => prog.lectureId === lectureId && prog.viewed);

//   const handleSelectLecture = (lecture) => {
//     setCurrentLecture(lecture);
//   };

//   const handleLectureProgress = async (lectureId) => {
//     await updateLectureProgress({ courseId, lectureId });
//     refetch();
//   };

//   const handleCompleteCourse = async () => {
//     await completeCourse(courseId);
//   };

//   const handleInCompleteCourse = async () => {
//     await inCompleteCourse(courseId);
//   };

//   if (!currentLecture) return <p>Loading lecture...</p>;

//   return (
//     <div className="max-w-7xl mx-auto p-4 mt-20">
//       <div className="flex justify-between mb-4">
//         <h1 className="text-2xl font-bold">{courseDetails.courseTitle}</h1>
//         <Button
//           variant={completed ? "outline" : "default"}
//           onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
//         >
//           {completed ? (
//             <div className="flex items-center">
//               <CheckCircle className="h-4 w-4 mr-2" />
//               <span>Completed</span>
//             </div>
//           ) : (
//             "Mark as Completed"
//           )}
//         </Button>
//       </div>

//       <div className="flex flex-col md:flex-row gap-6">
//         <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
//           <video
//             src={currentLecture.videoUrl}
//             controls
//             className="w-full h-auto md:rounded-lg"
//             onPlay={() => handleLectureProgress(currentLecture._id)}
//           />
//           <div className="mt-2">
//             <h3 className="font-medium text-lg">
//               {`Lecture ${
//                 courseDetails.lectures.findIndex(
//                   (lec) => lec._id === currentLecture._id
//                 ) + 1
//               } : ${currentLecture.lectureTitle}`}
//             </h3>
//           </div>
//         </div>

//         <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
//           <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
//           <div className="flex-1 overflow-y-auto">
//             {courseDetails.lectures.map((lecture) => (
//               <Card
//                 key={lecture._id}
//                 className={`mb-3 hover:cursor-pointer transition transform ${
//                   lecture._id === currentLecture._id
//                     ? "bg-gray-200"
//                     : "dark:bg-gray-800"
//                 }`}
//                 onClick={() => handleSelectLecture(lecture)}
//               >
//                 <CardContent className="flex items-center justify-between">
//                   <div className="flex items-center p-0">
//                     {isLectureCompleted(lecture._id) ? (
//                       <CheckCircle2 size={24} className="text-green-500 mr-2" />
//                     ) : (
//                       <CirclePlay size={24} className="text-gray-500 mr-2" />
//                     )}
//                     <div>
//                       <CardTitle className="text-lg font-medium">
//                         {lecture.lectureTitle}
//                       </CardTitle>
//                     </div>
//                   </div>
//                   {isLectureCompleted(lecture._id) && (
//                     <Badge
//                       variant="outline"
//                       className="bg-green-200 text-green-600"
//                     >
//                       Completed
//                     </Badge>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseProgress;
