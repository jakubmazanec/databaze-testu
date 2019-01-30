export var ResourceStatus;
(function (ResourceStatus) {
    ResourceStatus["idle"] = "IDLE";
    ResourceStatus["updating"] = "UPDATING";
    ResourceStatus["deleting"] = "DELETING";
})(ResourceStatus || (ResourceStatus = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["original"] = "ORIGINAL";
    ResourceType["translation"] = "TRANSLATION";
    ResourceType["data"] = "DATA";
    ResourceType["standards"] = "STANDARDS";
    ResourceType["scripts"] = "SCRIPTS";
    ResourceType["study"] = "STUDY";
    ResourceType["declaration"] = "DECLARATION";
    ResourceType["patronage"] = "PATRONAGE";
})(ResourceType || (ResourceType = {}));