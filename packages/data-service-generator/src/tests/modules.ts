import { ModuleAction, ModuleContainer } from "@amplication/code-gen-types";

const USER_MODULE_ID = "clraten4g000fc9yhr62nxheo";
import { USER_ENTITY_ID } from "./entities";

const userModuleContainer: ModuleContainer = {
  id: USER_MODULE_ID,
  resourceId: "clraten1t0004c9yhz1t3o8bp",
  parentBlockId: null,
  name: "User",
  enabled: true,
  entityId: USER_ENTITY_ID,
};
const userModuleDefaultActions: ModuleAction[] = [
  {
    id: "clraten5x000rc9yh29927zwf",
    displayName: "Find Users",
    description: "Find many Users",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "users",
    path: "",
    enabled: false, //disable the default action
    restVerb: "Get",
    actionType: "Find",
    gqlOperation: "Query",
  },
  {
    id: "clraten5o000hc9yh0fxyrgde",
    displayName: "Users Meta",
    description: "Meta data about User records",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "_usersMeta",
    path: "/:id/meta",
    enabled: true,
    restVerb: "Get",
    actionType: "Meta",
    gqlOperation: "Query",
  },
  {
    id: "clraten5q000nc9yhhyfin9wn",
    displayName: "Update User",
    description: "Update one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "updateUser",
    path: "/:id",
    enabled: true,
    restVerb: "Patch",
    actionType: "Update",
    gqlOperation: "Mutation",
  },
  {
    id: "clraten5p000kc9yhxeq2tiz0",
    displayName: "Get User",
    description: "Get one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "user",
    path: "/:id",
    enabled: true,
    restVerb: "Get",
    actionType: "Read",
    gqlOperation: "Query",
  },
  {
    id: "clraten5r000pc9yh9sxgjl3e",
    displayName: "Delete User",
    description: "Delete one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "deleteUser",
    path: "/:id",
    enabled: false, //disable the default action,
    restVerb: "Delete",
    actionType: "Delete",
    gqlOperation: "Mutation",
  },
  {
    id: "clraten5p000lc9yh1fn940ra",
    displayName: "Create User",
    description: "Create one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "createUser",
    path: "",
    enabled: true,
    restVerb: "Post",
    actionType: "Create",
    gqlOperation: "Mutation",
  },
];

const userModuleCustomActions: ModuleAction[] = [
  {
    id: "clraten5x000rc9yh29927zwf",
    displayName: "Promote User",
    description: "Promote one User to admin",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "promoteUser",
    path: "/{:id}/promote",
    enabled: true,
    restVerb: "Post",
    actionType: "Custom",
    gqlOperation: "Mutation",
    outputType: {
      isArray: true,
      type: "Dto",
      dtoId: "User", //replace with reference to dto by its id
    },
    inputType: {
      isArray: false,
      type: "String",
      dtoId: "", //replace with reference to dto by its id
    },
  },
  {
    id: "clraten5x000rc9yh29927zwf",
    displayName: "Send Password Reset Email",
    description: "Send password reset email to one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "sendPasswordResetEmail",
    path: "/{:id}/sendPasswordResetEmail",
    enabled: true,
    restVerb: "Post",
    actionType: "Custom",
    gqlOperation: "Mutation",
    outputType: {
      isArray: false,
      type: "Boolean",
      dtoId: "",
    },
    inputType: {
      isArray: false,
      type: "Dto",
      dtoId: "SendPasswordResetEmailArgs", //replace with reference to dto by its id
    },
  },
  {
    id: "clraten5x000rc9yh29927zwf",
    displayName: "Resend Invite Email",
    description: "Resend invite email to one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "resendInviteEmail",
    path: "/{:id}/resendInviteEmail",
    enabled: true,
    restVerb: "Post",
    actionType: "Custom",
    gqlOperation: "Mutation",
    outputType: {
      isArray: false,
      type: "Dto",
      dtoId: "ResendInviteEmailResults", //replace with reference to dto by its id
    },
    inputType: {
      isArray: false,
      type: "Dto",
      dtoId: "ResendInviteEmailArgs", //replace with reference to dto by its id
    },
  },
  {
    id: "clraten5x000rc9yh29927zwf",
    displayName: "Soft Delete User",
    description: "Soft delete one User",
    resourceId: "clraten1t0004c9yhz1t3o8bp",
    parentBlockId: USER_MODULE_ID,
    name: "softDeleteUser",
    path: "/{:id}/softDeleteUser",
    enabled: true,
    restVerb: "Post",
    actionType: "Custom",
    gqlOperation: "Mutation",
    outputType: {
      isArray: false,
      type: "Dto",
      dtoId: "SoftDeleteUserResults", //replace with reference to dto by its id
    },
    inputType: {
      isArray: false,
      type: "Dto",
      dtoId: "SoftDeleteUserArgs", //replace with reference to dto by its id
    },
  },
];

export const moduleContainers = [userModuleContainer];
export const defaultActions = [...userModuleDefaultActions];
export const customActions = [...userModuleCustomActions];

export const moduleActions = [...defaultActions, ...customActions];
