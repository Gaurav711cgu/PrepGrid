import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Question.js";

dotenv.config();

const QUESTIONS = [
  {
    title: "Two Sum",
    difficulty: "easy",
    topics: ["Arrays", "Hash Map"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" }],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  \n}",
      python: "def twoSum(nums, target):\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    \n}",
    },
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: true },
    ],
    companies: ["Google", "Amazon", "Meta"],
    acceptanceRate: 49.1,
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    topics: ["Strings", "Stack"],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [{ input: 's = "()"', output: "true" }, { input: 's = "()[]{}"', output: "true" }, { input: 's = "(]"', output: "false" }],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    starterCode: {
      javascript: "function isValid(s) {\n  \n}",
      python: "def isValid(s):\n    pass",
    },
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
    ],
    companies: ["Amazon", "Bloomberg", "Microsoft"],
    acceptanceRate: 40.7,
  },
  {
    title: "Reverse Linked List",
    difficulty: "easy",
    topics: ["Linked List", "Recursion"],
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
    constraints: ["The number of nodes in the list is the range [0, 5000]"],
    starterCode: {
      javascript: "function reverseList(head) {\n  \n}",
      python: "def reverseList(head):\n    pass",
    },
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1" },
      { input: "1 2", expectedOutput: "2 1" },
    ],
    companies: ["Adobe", "Apple", "Microsoft"],
    acceptanceRate: 73.6,
  },
  {
    title: "Maximum Subarray",
    difficulty: "medium",
    topics: ["Arrays", "DP"],
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum. This is the classic Kadane's Algorithm problem.",
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6" }],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n  \n}",
      python: "def maxSubArray(nums):\n    pass",
    },
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { input: "1", expectedOutput: "1" },
      { input: "5 4 -1 7 8", expectedOutput: "23", isHidden: true },
    ],
    companies: ["Amazon", "Apple", "LinkedIn"],
    acceptanceRate: 49.7,
  },
  {
    title: "Longest Common Subsequence",
    difficulty: "medium",
    topics: ["DP", "Strings"],
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    examples: [{ input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: "The longest common subsequence is ace with length 3" }],
    constraints: ["1 <= text1.length, text2.length <= 1000"],
    starterCode: {
      javascript: "function longestCommonSubsequence(text1, text2) {\n  \n}",
      python: "def longestCommonSubsequence(text1, text2):\n    pass",
    },
    testCases: [
      { input: "abcde\nace", expectedOutput: "3" },
      { input: "abc\nabc", expectedOutput: "3" },
      { input: "abc\ndef", expectedOutput: "0", isHidden: true },
    ],
    companies: ["Amazon", "Google", "Microsoft"],
    acceptanceRate: 57.4,
  },
  {
    title: "Number of Islands",
    difficulty: "medium",
    topics: ["Graphs", "BFS", "DFS"],
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [{ input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: "2" }],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
    starterCode: {
      javascript: "function numIslands(grid) {\n  \n}",
      python: "def numIslands(grid):\n    pass",
    },
    testCases: [
      { input: "3 3\n1 1 0\n0 1 0\n0 0 1", expectedOutput: "2" },
      { input: "1 1\n1", expectedOutput: "1" },
    ],
    companies: ["Amazon", "Google", "Bloomberg"],
    acceptanceRate: 57.4,
  },
  {
    title: "Trapping Rain Water",
    difficulty: "hard",
    topics: ["Arrays", "Two Pointers", "DP"],
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of rain water are trapped" }],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    starterCode: {
      javascript: "function trap(height) {\n  \n}",
      python: "def trap(height):\n    pass",
    },
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
      { input: "4 2 0 3 2 5", expectedOutput: "9", isHidden: true },
    ],
    companies: ["Amazon", "Google", "Goldman Sachs"],
    acceptanceRate: 60.2,
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    topics: ["Trees", "BFS"],
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" }],
    constraints: ["The number of nodes in the tree is in the range [0, 2000]"],
    starterCode: {
      javascript: "function levelOrder(root) {\n  \n}",
      python: "def levelOrder(root):\n    pass",
    },
    testCases: [
      { input: "3 9 20 -1 -1 15 7", expectedOutput: "3\n9 20\n15 7" },
    ],
    companies: ["Amazon", "Microsoft", "Facebook"],
    acceptanceRate: 65.1,
  },
  {
    title: "Coin Change",
    difficulty: "medium",
    topics: ["DP"],
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return -1.",
    examples: [{ input: "coins = [1,5,11,15,20,25], amount = 11", output: "1" }],
    starterCode: {
      javascript: "function coinChange(coins, amount) {\n  \n}",
      python: "def coinChange(coins, amount):\n    pass",
    },
    testCases: [
      { input: "3\n1 2 5\n11", expectedOutput: "3" },
      { input: "1\n2\n3", expectedOutput: "-1", isHidden: true },
    ],
    companies: ["Amazon", "Microsoft", "Google"],
    acceptanceRate: 41.8,
  },
  {
    title: "Merge Intervals",
    difficulty: "medium",
    topics: ["Arrays", "Sorting"],
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }],
    starterCode: {
      javascript: "function merge(intervals) {\n  \n}",
      python: "def merge(intervals):\n    pass",
    },
    testCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18" },
      { input: "2\n1 4\n4 5", expectedOutput: "1 5", isHidden: true },
    ],
    companies: ["Facebook", "Google", "Twitter"],
    acceptanceRate: 45.9,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  await Question.deleteMany({});
  console.log("🗑️  Cleared existing questions");

  const inserted = await Question.insertMany(QUESTIONS);
  console.log(`✅ Seeded ${inserted.length} questions`);

  await mongoose.disconnect();
  console.log("👋 Done!");
}

seed().catch((err) => { console.error(err); process.exit(1); });
