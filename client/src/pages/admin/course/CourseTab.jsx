import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });
  const params = useParams();
  const courseId = params.courseId;
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (courseId) {
      setEnabled(true);
    }
  }, [courseId]);

  const {
    data: courseByIdData,
    isLoading: courseByIdLoading,
    refetch,
  } = useGetCourseByIdQuery(courseId, {
    skip: !enabled,
    refetchOnMountOrArgChange: true,
  });

  const [publishCourse,{}]=usePublishCourseMutation();

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: "",
      });
      setPreviewThumbnail(course.courseThumbnail);
    }
  }, [courseByIdData]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const navigate = useNavigate();

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    formData.append("courseThumbnail", input.courseThumbnail);

    try {
      const result = await editCourse({ formData, courseId }).unwrap();
      toast.success(result.message || "Course updated");
      refetch();
      navigate("/admin/course");
    } catch (err) {
      toast.error(err.data?.message || "Failed to update course");
    }
  };

  const publishStatusHandler = async(action) => {
    try {
      const response = await publishCourse({courseId,query:action});
      if(response.data){
        refetch();
        toast.success(response.data.message);
      }
      
    } catch (error) {
      toast.error("Failed to publish or unpublish Course")
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Course Updated");
    }
    if (error) {
      toast.error(error.data.message || "Failed to update course");
    }
  }, [isSuccess, error]);

  if (courseByIdLoading) return <h1>Loading...</h1>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make Changes to your courses here. Click save when you are done
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
          disabled={courseByIdData?.course.lectures.length === 0}
            variant="outline"
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true") }>
            {courseByIdData?.course.isPublished ? "unPublished" : "Publish"}
          </Button>
          <Button>Remove Course</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <Label>Title</Label>
          <Input
            type="text"
            name="courseTitle"
            value={input.courseTitle}
            onChange={changeEventHandler}
            placeholder="Eg. Full Stack Developer"
          />
        </div>
        <div className="space-y-4 mt-5">
          <Label>Sub Title</Label>
          <Input
            type="text"
            name="subTitle"
            value={input.subTitle}
            onChange={changeEventHandler}
            placeholder="Eg. Become a full stack Devloper from begineer to pro"
          />
        </div>
        <div className="space-y-4 mt-5">
          <Label>Description</Label>
          <RichTextEditor input={input} setInput={setInput} />
        </div>
        <div className="flex items-center gap-5">
          <div className="mt-4 space-y-3">
            <Label>Category</Label>
            <Select value={input.category} onValueChange={selectCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="Next JS">Next JS</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Frontend Development">
                    Frontend Development
                  </SelectItem>
                  <SelectItem value="Fullstack Development">
                    Fullstack Development
                  </SelectItem>
                  <SelectItem value="MERN Stack Development">
                    MERN Stack Development
                  </SelectItem>
                  <SelectItem value="Javascript">Javascript</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Docker">Docker</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 space-y-3">
            <Label>Course Level</Label>
            <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Course Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Course Level</SelectLabel>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 space-y-3">
            <Label>Price in (INR)</Label>
            <Input
              type="number"
              name="coursePrice"
              value={input.coursePrice}
              onChange={changeEventHandler}
              placeholder="199"
              className="w-fit"
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Label>Course Thumbnail</Label>
          <Input
            type="file"
            onChange={selectThumbnail}
            accept="image/*"
            className="w-fit"
          />
          {previewThumbnail && (
            <img
              src={previewThumbnail}
              className="w-64 my-2"
              alt="Course Thumbnail"
            />
          )}
        </div>
        <div className="mt-4 space-y-3 space-x-2">
          <Button onClick={() => navigate("/admin/course")} variant="outline">
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={updateCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
