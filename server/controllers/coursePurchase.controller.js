import Stripe from "stripe"
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const createCheckOutSession = async (req, res) => {
//     try {
//         const userId = req.id;
//         const { courseId } = req.body;

//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({
//                 message: "Course Not Found"
//             })
//         }
//         // create a new course purchase record
//         const newPurchase = new CoursePurchase({
//             courseId,
//             userId,
//             amount: course.coursePrice,
//             status: "pending"
//         });
//         // create a stripe checkout session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "inr",
//                         product_data: {
//                             name: course.courseTitle,
//                             images: [course.courseThumbnail],
//                         },
//                         unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
//                     },
//                     quantity: 1,
//                 },
//             ],
//             mode: "payment",
//             success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
//             cancel_url: `http://localhost:5173/course-detail/${courseId}`,
//             metadata: {
//                 courseId: courseId,
//                 userId: userId,
//             },
//             shipping_address_collection: {
//                 allowed_countries: ["IN"], // Optionally restrict allowed countries
//             },
//         });

//         if (!session.url) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Error while creating session" });
//         }

//         // Save the purchase record
//         newPurchase.paymentId = session.id;
//         await newPurchase.save();

//         return res.status(200).json({
//             success: true,
//             url: session.url, // Return the Stripe checkout URL
//         });
//     } catch (error) {
//         console.log(error);

//     }
// }

// export const stripeWebhook = async (req, res) => {
//     let event;

//     try {
//         const payloadString = JSON.stringify(req.body, null, 2);
//         const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

//         const header = stripe.webhooks.generateTestHeaderString({
//             payload: payloadString,
//             secret,
//         });

//         event = stripe.webhooks.constructEvent(payloadString, header, secret);
//     } catch (error) {
//         console.error("Webhook error:", error.message);
//         return res.status(400).send(`Webhook error: ${error.message}`);
//     }

//     // Handle the checkout session completed event
//     if (event.type === "checkout.session.completed") {
//         console.log("check session complete is called");

//         try {
//             const session = event.data.object;

//             const purchase = await CoursePurchase.findOne({
//                 paymentId: session.id,
//             }).populate({ path: "courseId" });

//             if (!purchase) {
//                 return res.status(404).json({ message: "Purchase not found" });
//             }

//             if (session.amount_total) {
//                 purchase.amount = session.amount_total / 100;
//             }
//             purchase.status = "completed";

//             // Make all lectures visible by setting `isPreviewFree` to true
//             if (purchase.courseId && purchase.courseId.lectures.length > 0) {
//                 await Lecture.updateMany(
//                     { _id: { $in: purchase.courseId.lectures } },
//                     { $set: { isPreviewFree: true } }
//                 );
//             }

//             await purchase.save();

//             // Update user's enrolledCourses
//             await User.findByIdAndUpdate(
//                 purchase.userId,
//                 { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
//                 { new: true }
//             );

//             // Update course to add user ID to enrolledStudents
//             await Course.findByIdAndUpdate(
//                 purchase.courseId._id,
//                 { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
//                 { new: true }
//             );
//         } catch (error) {
//             console.error("Error handling event:", error);
//             return res.status(500).json({ message: "Internal Server Error" });
//         }
//     }
//     res.status(200).send();
// };

export const createCheckOutSession = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found!" });

        let pendingPurchase = await CoursePurchase.findOne({
            userId,
            courseId,
            status: "pending",
        });

        if (pendingPurchase) {
            try {
                // Try to retrieve existing Stripe session
                const existingSession = await stripe.checkout.sessions.retrieve(pendingPurchase.paymentId);

                // Check if session is expired or completed
                // Stripe session expires after 24h and status can be 'open' or 'complete'
                // Only reuse if status is 'open'
                if (existingSession && existingSession.status === "open") {
                    return res.status(200).json({
                        success: true,
                        url: existingSession.url, // Return existing session URL
                        message: "Please complete your pending payment",
                    });
                }
            } catch (error) {
                // If session not found or expired, continue to create a new session below
                console.log("Existing Stripe session not valid or expired, creating new one.");
            }
        }

        // Create new Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.courseTitle,
                            images: [course.courseThumbnail],
                        },
                        unit_amount: course.coursePrice * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/course-progress/${courseId}`,
            cancel_url: `http://localhost:5173/course-detail/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
            },
            shipping_address_collection: {
                allowed_countries: ["IN"],
            },
        });

        if (!session.url) {
            return res.status(400).json({ success: false, message: "Error creating Stripe session" });
        }

        if (pendingPurchase) {
            // Update existing purchase with new session id
            pendingPurchase.paymentId = session.id;
            pendingPurchase.amount = course.coursePrice;
            await pendingPurchase.save();
        } else {
            // Create new purchase record
            const newPurchase = new CoursePurchase({
                courseId,
                userId,
                amount: course.coursePrice,
                status: "pending",
                paymentId: session.id,
            });
            await newPurchase.save();
        }

        return res.status(200).json({
            success: true,
            url: session.url,
        });

    } catch (error) {
        console.error("Error in createCheckoutSession:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const stripeWebhook = async (req, res) => {
    let event;

    const sig = req.headers["stripe-signature"];
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    try {
        // Construct Stripe event using raw body and real signature
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (error) {
        console.error("❌ Webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // ✅ Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        console.log("✅ Stripe payment completed webhook received");

        try {
            const session = event.data.object;

            // Find the course purchase based on paymentId (which is session.id)
            const purchase = await CoursePurchase.findOne({
                paymentId: session.id,
            }).populate({ path: "courseId" });

            if (!purchase) {
                console.error("❌ Purchase not found for session ID:", session.id);
                return res.status(404).json({ message: "Purchase not found" });
            }

            // Mark purchase as completed
            purchase.status = "completed";
            if (session.amount_total) {
                purchase.amount = session.amount_total / 100;
            }

            // Unlock all lectures
            if (purchase.courseId?.lectures?.length > 0) {
                await Lecture.updateMany(
                    { _id: { $in: purchase.courseId.lectures } },
                    { $set: { isPreviewFree: true } }
                );
            }

            await purchase.save();

            // Enroll user in course
            await User.findByIdAndUpdate(
                purchase.userId,
                { $addToSet: { enrolledCourses: purchase.courseId._id } },
                { new: true }
            );

            await Course.findByIdAndUpdate(
                purchase.courseId._id,
                { $addToSet: { enrolledStudents: purchase.userId } },
                { new: true }
            );

            console.log("✅ Purchase completed and course access granted.");
        } catch (error) {
            console.error("❌ Error handling Stripe webhook event:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // Respond to Stripe that webhook was received successfully
    res.status(200).send();
};
//new en




export const getCourseDetailWithPurchaseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId).populate({ path: "creator" }).populate({ path: "lectures" });

        const purchased = await CoursePurchase.findOne({ userId, courseId });
        if (!course) {
            return res.status(404).json({
                message: "Course Not Found"
            });
        }
        return res.status(200).json({
            course,
            purchased: !!purchased,
            purchaseStatus: purchased?.status || null,
        })
    } catch (error) {
        console.log(error);
    }
};

export const getAllPurchasedCourse = async (_, res) => {
    try {
        const purchasedCourse = await CoursePurchase.find({ status: "completed" }).populate("courseId");
        if (!purchasedCourse) {
            return res.status(404).json({
                purchasedCourse: [],
            })
        }
        return res.status(200).json({
            purchasedCourse,
        })

    } catch (error) {
        console.log(error);
    }
}