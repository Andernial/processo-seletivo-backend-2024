// // import { GraphQLScalarType } from 'graphql';
// import Upload from 'graphql-upload/Upload.mjs';
// // import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

// export const UploadScalar = new GraphQLScalarType({
//   name: 'Upload',
//   description: 'Upload scalar type',
//   serialize(value: unknown): string {
//     // Check type of value
//     if (!(value instanceof Upload)) {
//       throw new Error('UploadTypeScalar can only serialize ObjectId values');
//     }
//     return value.toHexString(); // Value sent to client
//   },
//   parseValue(value: unknown): Upload {
//     // Check type of value
//     if (typeof value !== 'string') {
//       throw new Error('UploadTypeScalar can only parse string values');
//     }
//     return new Upload(value); // Value from client input variables
//   },
//   parseLiteral(ast): Upload {
//     // Check type of value
//     if (ast.kind !== Kind.STRING) {
//       throw new Error('UploadTypeScalar can only parse string values');
//     }
//     return new Upload(ast.value); // Value from client query
//   },
// });
