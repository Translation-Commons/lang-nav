// Enable this to enforce architectural boundaries between layers of the app.

// module.exports = {
//   rules: {
//     // Examples – adjust paths for your repo:
//     "no-restricted-imports": [
//       "error",
//       {
//         patterns: [
//           { group: ["src/features/**"], message: "Features must not import pages/app." },
//           { group: ["src/entities/**"], message: "Entities must not import features/widgets/pages/app." },
//           { group: ["src/shared/**"], message: "Shared must not import entities/features/widgets/pages/app." },
//         ],
//       },
//     ],
//   },
// };
