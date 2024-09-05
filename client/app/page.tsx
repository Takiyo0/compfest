import {Manrope} from "next/font/google";
import AIProcessing from "@/app/AIProcessing";
import HomePage from "@/app/Homepage";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import {getCookie} from "cookies-next";
import {cookies} from "next/headers";

const manrope = Manrope({subsets: ["latin"]});

// const expandedSampleTree: TreeResponse = {
//     ready: true,
//     skillTree: [
//         {
//             id: 1,
//             isParent: true,
//             name: "Your Skill Tree",
//             entries: [],
//             finished: false,
//             child: [2, 3]
//         },
//         {
//             id: 2,
//             isParent: true,
//             name: "Branch 1",
//             entries: [
//                 {title: "Branch 1 Entry", description: "Branch 1 of the skill tree", finished: false}
//             ],
//             finished: false,
//             child: [4, 5] // This branch has further children
//         },
//         {
//             id: 3,
//             isParent: true,
//             name: "Branch 2",
//             entries: [
//                 {title: "Branch 2 Entry", description: "Branch 2 of the skill tree", finished: true}
//             ],
//             finished: true,
//             child: [6] // This branch has a single child
//         },
//         {
//             id: 4,
//             isParent: true,
//             name: "Sub-Branch 1",
//             entries: [
//                 {title: "Sub-Branch 1 Entry", description: "A sub-branch under Branch 1", finished: false}
//             ],
//             finished: false,
//             child: [7, 8] // This sub-branch has its own children
//         },
//         {
//             id: 5,
//             isParent: false,
//             name: "Leaf 1",
//             entries: [
//                 {title: "Leaf 1 Entry", description: "A leaf node under Branch 1", finished: true}
//             ],
//             finished: true,
//             child: [] // This is a leaf node with no further children
//         },
//         {
//             id: 6,
//             isParent: false,
//             name: "Leaf 2",
//             entries: [
//                 {title: "Leaf 2 Entry", description: "A leaf node under Branch 2", finished: false}
//             ],
//             finished: false,
//             child: [] // This is a leaf node with no further children
//         },
//         {
//             id: 7,
//             isParent: true,
//             name: "Sub-Leaf 1",
//             entries: [
//                 {title: "Sub-Leaf 1 Entry", description: "A sub-leaf under Sub-Branch 1", finished: false}
//             ],
//             finished: false,
//             child: [9] // This sub-leaf has a child
//         },
//         {
//             id: 8,
//             isParent: false,
//             name: "Leaf 3",
//             entries: [
//                 {title: "Leaf 3 Entry", description: "A leaf node under Sub-Branch 1", finished: true}
//             ],
//             finished: true,
//             child: [] // This is a leaf node with no further children
//         },
//         {
//             id: 9,
//             isParent: false,
//             name: "Final Leaf",
//             entries: [
//                 {title: "Final Leaf Entry", description: "A final leaf in the tree", finished: true}
//             ],
//             finished: true,
//             child: [] // This is a leaf node with no further children
//         }
//     ]
// };


export default async function Home() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");

    if (!user.userId) return redirect("/login");
    // if (user.interviewQuestionStatus == "IN_PROGRESS") return redirect("/challenge/interview");

    const {data} = await ApiManager.GetTree(abort.signal, authorization ?? "");

    return <HomePage data={data.skillTree} userData={user}/>;
}
