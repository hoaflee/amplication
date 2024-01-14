import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../../context/appContext";
import * as models from "../../../models";
import {
  CREATE_RESOURCE_ENTITIES,
  GET_RESOURCES,
} from "../queries/modelsQueries";
import { ModelChanges, Node } from "../types";
import { entitiesToNodesAndEdges, tempResourceToNode } from "../helpers";
import { Edge, useEdgesState } from "reactflow";
import { applyAutoLayout } from "../layout";
import useLocalStorage from "react-use-localstorage";

type TData = {
  resources: models.Resource[];
};

type modelChangesData = {
  projectId: string;
  modelGroupsResources: {
    tempId: string;
    name: string;
  }[];
  entitiesToCopy: {
    targetResourceId: string;
    entityId: string;
  }[];
};

const LOCAL_NODES_STORAGE_KEY = "ModelOrganizerNodesData";
const LOCAL_DETAILED_EDGES_STORAGE_KEY = "ModelOrganizerDetailedEdgesData";
const LOCAL_SIMPLE_EDGES_STORAGE_KEY = "ModelOrganizerSimpleEdgesData";

const useModelOrganization = () => {
  const { currentProject } = useContext(AppContext);
  const [searchPhrase, setSearchPhrase] = useState<string>("");
  // const [modelGroups, setModelGroups] = useState<ResourceNode[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]); // main data elements for save
  const [currentResourcesData, setCurrentResourcesData] = useState<
    models.Resource[]
  >([]);
  const [selectedNode, setSelectedNode] = useState<Node>(null);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showRelationDetails, setShowRelationDetails] = useState(false);

  const [currentTheme, setCurrentTheme] = useLocalStorage(
    LOCAL_NODES_STORAGE_KEY,
    ""
  );

  const [currentDetailedStorageEdges, setCurrentDetailedStorageEdges] =
    useLocalStorage(LOCAL_DETAILED_EDGES_STORAGE_KEY, null);

  const [currentSimpleStorageEdges, setCurrentSimpleStorageEdges] =
    useLocalStorage(LOCAL_SIMPLE_EDGES_STORAGE_KEY, null);

  const [currentChangesStorageData, setCurrentChangesStorageData] =
    useLocalStorage("currentChangesData", "");

  const [currentResourcesStorageData, setCurrentResourceStorageData] =
    useLocalStorage("currentResourceData", "");

  const [changes, setChanges] = useState<ModelChanges>({
    movedEntities: [],
    newServices: [],
  });

  useEffect(() => {
    if (currentChangesStorageData !== "") {
      const data: ModelChanges = JSON.parse(currentChangesStorageData);
      setChanges(data);
    }
  }, [currentChangesStorageData, setChanges]);

  const [
    loadProjectResourcesInternal,
    { loading: loadingResources, error: resourcesError, data: resourcesData },
  ] = useLazyQuery<TData>(GET_RESOURCES, {
    variables: {
      projectId: currentProject?.id,
    },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (currentResourcesStorageData !== "") {
      setCurrentResourcesData(JSON.parse(currentResourcesStorageData));
    }
  }, [setCurrentResourcesData, currentResourcesStorageData]);

  const loadProjectResources = useCallback(() => {
    if (currentTheme !== "" && currentTheme) {
      return;
    }

    loadProjectResourcesInternal({
      variables: {
        projectId: currentProject?.id,
      },
      onCompleted: async (data) => {
        const { nodes, detailedEdges, simpleEdges } =
          await entitiesToNodesAndEdges(data.resources, showRelationDetails);
        setCurrentResourceStorageData(JSON.stringify(data.resources));

        setCurrentDetailedStorageEdges(JSON.stringify(detailedEdges));
        setCurrentSimpleStorageEdges(JSON.stringify(simpleEdges));

        setNodes(nodes);
        setCurrentTheme(JSON.stringify(nodes));

        if (showRelationDetails) {
          setEdges(detailedEdges);
        } else {
          setEdges(simpleEdges);
        }
      },
    });
  }, [
    loadProjectResourcesInternal,
    setCurrentResourceStorageData,
    setEdges,
    setCurrentDetailedStorageEdges,
    setCurrentSimpleStorageEdges,
    setNodes,
    setCurrentTheme,
    changes,
    showRelationDetails,
    currentDetailedStorageEdges,
    currentSimpleStorageEdges,
    currentProject,
    edges,
    currentTheme,
  ]);

  const toggleShowRelationDetails = useCallback(async () => {
    const currentShowRelationDetails = !showRelationDetails;
    const currentEdges = currentShowRelationDetails
      ? (JSON.parse(currentDetailedStorageEdges) as Edge[])
      : (JSON.parse(currentSimpleStorageEdges) as Edge[]);

    setShowRelationDetails(currentShowRelationDetails);

    setEdges(currentEdges);

    const updatedNodes = await applyAutoLayout(
      nodes,
      currentEdges,
      currentShowRelationDetails
    );
    setCurrentTheme(JSON.stringify(updatedNodes));
  }, [
    showRelationDetails,
    currentDetailedStorageEdges,
    nodes,
    currentSimpleStorageEdges,
    setEdges,
    setShowRelationDetails,
    setCurrentTheme,
  ]);

  const resetChanges = useCallback(() => {
    setChanges({
      movedEntities: [],
      newServices: [],
    });
    setCurrentTheme("");
    setCurrentDetailedStorageEdges("");
    setCurrentSimpleStorageEdges("");
    setCurrentChangesStorageData("");
  }, [
    setChanges,
    setCurrentTheme,
    setCurrentDetailedStorageEdges,
    setCurrentSimpleStorageEdges,
    setCurrentChangesStorageData,
  ]);

  const mergeNewResourcesChanges = useCallback(() => {
    loadProjectResourcesInternal({
      variables: {
        projectId: currentProject?.id,
      },
      onCompleted: async (data) => {
        if (data?.resources) {
          const resourceMapping = currentResourcesData.reduce(
            (resourcesObj, resource) => {
              resourcesObj[resource.id] = resource;
              return resourcesObj;
            },
            {}
          );

          const updatedResourceMapping = data.resources.reduce(
            (resourcesObj, resource) => {
              resourcesObj[resource.id] = resource;
              return resourcesObj;
            },
            {}
          );

          let updatedResourcesData = currentResourcesData;
          let hasChanges = false;

          data.resources.forEach((updateResource) => {
            const currentResource = resourceMapping[updateResource.id];
            if (!currentResource) {
              updatedResourcesData.push(updateResource);
              hasChanges = true;
              return;
            }

            const currentEntityMapping = currentResource.entities?.reduce(
              (entitiesObj, entity) => {
                entitiesObj[entity.id] = entity;
                return entitiesObj;
              },
              {}
            );
            updateResource.entities?.forEach((e) => {
              const currentEntity = currentEntityMapping[e.id];
              const movedEntity = changes.movedEntities.find(
                (x) => x.entityId === e.id
              );

              if (!currentEntity && !movedEntity) {
                currentResource.entities?.push(e);
                hasChanges = true;
              }
            });
          });

          currentResourcesData.forEach((resource) => {
            const currentResource: models.Resource =
              updatedResourceMapping[resource.id];
            if (!currentResource) {
              const resourceEntitiesChanges = changes?.movedEntities
                ?.filter((x) => x.targetResourceId === resource.id)
                .map((entity) => {
                  entity.targetResourceId = entity.originalResourceId;
                  return entity;
                });
              changes.movedEntities = [...resourceEntitiesChanges];

              updatedResourcesData = updatedResourcesData.filter(
                (r) => r.id !== resource.id
              );
              hasChanges = true;
            } else {
              const updatedEntityMapping = currentResource.entities?.reduce(
                (entitiesObj, entity) => {
                  entitiesObj[entity.id] = entity;
                  return entitiesObj;
                },
                {}
              );

              const currentResourceEntities = updatedResourcesData.find(
                (x) => x.id === resource.id
              );

              resource.entities?.forEach((entity) => {
                const currentEntity: models.Entity =
                  updatedEntityMapping[entity.id];
                const movedEntity = changes.movedEntities.find(
                  (x) => x.entityId === entity.id
                );

                if (!currentEntity) {
                  if (!movedEntity) {
                    currentResourceEntities.entities = resource.entities.filter(
                      (e) => e.id !== entity.id
                    );
                    hasChanges = true;
                  } else {
                    const originalResourceEntity = data.resources
                      .find((x) => x.id === movedEntity.originalResourceId)
                      .entities?.find((e) => e.id === movedEntity.entityId);

                    if (!originalResourceEntity) {
                      hasChanges = true;

                      currentResourceEntities.entities =
                        resource.entities.filter(
                          (e) => e.id !== movedEntity.entityId
                        );
                      changes.movedEntities = changes.movedEntities.filter(
                        (x) => x.entityId !== movedEntity.entityId
                      );
                    }
                  }
                }
              });
            }
          });

          if (hasChanges) {
            const { nodes, detailedEdges, simpleEdges } =
              await entitiesToNodesAndEdges(
                updatedResourcesData,
                showRelationDetails
              );

            setCurrentResourceStorageData(JSON.stringify(updatedResourcesData));

            setCurrentDetailedStorageEdges(JSON.stringify(detailedEdges));
            setCurrentSimpleStorageEdges(JSON.stringify(simpleEdges));

            setCurrentTheme(JSON.stringify(nodes));
            setCurrentChangesStorageData(JSON.stringify(changes));

            if (showRelationDetails) {
              setEdges(detailedEdges);
            } else {
              setEdges(simpleEdges);
            }
          }
        }
      },
    });
  }, [
    currentResourcesData,
    setCurrentDetailedStorageEdges,
    setCurrentTheme,
    setCurrentChangesStorageData,
    currentChangesStorageData,
    setCurrentResourceStorageData,
    showRelationDetails,
    changes,
  ]);

  const searchPhraseChanged = useCallback(
    (searchPhrase: string) => {
      if (searchPhrase === "") {
        nodes.forEach((x) => (x.hidden = false));
      } else {
        const searchModelGroupNodes = nodes.filter(
          (node) =>
            node.type === "modelGroup" &&
            !node.data.payload.name.includes(searchPhrase) &&
            node.id !== selectedNode?.id
        );

        searchModelGroupNodes.forEach((x) => {
          x.hidden = true;
          const childrenNodes = nodes.filter(
            (node) => node.data.originalParentNode === x.id
          );

          childrenNodes.forEach((x) => (x.hidden = true));
        });
      }

      setNodes((nodes) => [...nodes]);
    },
    [nodes, setNodes]
  );

  const modelGroupFilterChanged = useCallback(
    (event: any, modelGroup: Node) => {
      const currentNode = nodes.find((node) => node.id === modelGroup.id);

      currentNode.hidden = !currentNode.hidden;

      const childrenNodes = nodes.filter(
        (node) => node.data.originalParentNode === currentNode.id
      );

      childrenNodes.forEach((x) => (x.hidden = currentNode.hidden));
      setNodes((nodes) => [...nodes]);
    },
    [setNodes, nodes]
  );

  const createNewTempService = useCallback(
    async (newResource: models.Resource) => {
      const currentIndex =
        nodes.filter((x) => x.type === "modelGroup").length + 1;
      const newResourceNode = tempResourceToNode(newResource, currentIndex);
      nodes.push(newResourceNode);

      const newService = {
        tempId: newResource.tempId,
        name: newResource.name,
      };

      changes.newServices.push(newService);
      //todo: add new service to resource list

      const updatedNodes = await applyAutoLayout(
        nodes,
        edges,
        showRelationDetails
      );

      setChanges((changes) => changes);
      setCurrentTheme(JSON.stringify(updatedNodes));
      setCurrentChangesStorageData(JSON.stringify(changes));
    },
    [
      setChanges,
      setCurrentTheme,
      setCurrentChangesStorageData,
      changes,
      nodes,
      showRelationDetails,
    ]
  );

  const setDraggableNodes = useCallback(
    (resource: models.Resource) => {
      setNodes((nodes) => {
        nodes.forEach((node) => {
          if (node.data.originalParentNode === resource.id) {
            node.draggable = true;
          }
          if (node.id === resource.id) {
            node.selected = true;
            setSelectedNode(node);
          }
        });

        return [...nodes];
      });
    },
    [nodes, setNodes, setSelectedNode]
  );

  useEffect(() => {
    if (currentTheme === "" || !currentTheme) {
      loadProjectResources();
    }
  }, [currentTheme]);

  const resetToOriginalState = useCallback(() => {
    resetChanges();
  }, [resetChanges]);

  useEffect(() => {
    if (currentProject?.id) {
      loadProjectResources();
    }
  }, [currentProject]);

  const moveNodeToParent = useCallback(
    (node: Node, targetParent: Node) => {
      const currentNode = nodes.find((n) => n.id === node.id);
      const originalResource = currentResourcesData.find(
        (x) => x.id === currentNode.data.originalParentNode
      );

      const targetResource = currentResourcesData.find(
        (x) => x.id === targetParent.id
      );

      const currentEntity = currentNode.data.payload as models.Entity;
      currentNode.parentNode = targetParent.id;

      const currentEntityChanged = changes.movedEntities.find(
        (x) => x.entityId === node.id
      );

      if (currentEntityChanged) {
        if (currentNode.data.originalParentNode === currentNode.parentNode) {
          //remove the change from the changes list
          changes.movedEntities = changes.movedEntities.filter(
            (x) => x.entityId !== currentEntityChanged.entityId
          );
          originalResource.entities.push(currentEntity);
        } else {
          const currentResource = currentResourcesData.find(
            (x) => x.id === currentEntityChanged.targetResourceId
          );
          currentResource.entities = currentResource.entities?.filter(
            (x) => x.id !== currentEntity.id
          );
          currentEntityChanged.targetResourceId = targetParent.id;
          targetResource.entities.push(currentEntity);
        }
      } else {
        if (currentNode.data.originalParentNode !== currentNode.parentNode) {
          changes.movedEntities.push({
            entityId: currentNode.id,
            targetResourceId: targetParent.id,
            originalResourceId: currentNode.data.originalParentNode,
          });

          originalResource.entities = originalResource.entities.filter(
            (x) => x.id !== currentEntity.id
          );
          targetResource.entities.push(currentEntity);
        }
      }

      setCurrentTheme(JSON.stringify(nodes));
      setCurrentChangesStorageData(JSON.stringify(changes));
      setCurrentResourceStorageData(JSON.stringify(currentResourcesData));
    },
    [
      changes,
      nodes,
      currentResourcesData,
      currentTheme,
      setCurrentResourceStorageData,
      setCurrentTheme,
      setCurrentChangesStorageData,
    ]
  );

  useEffect(() => {
    if (currentTheme === "" || !currentTheme) return;
    setNodes(JSON.parse(currentTheme));
  }, [setNodes, currentTheme]);

  const [
    createResourceEntities,
    { loading: loadingCreateEntities, error: createEntitiesError },
  ] = useMutation<modelChangesData>(CREATE_RESOURCE_ENTITIES, {});

  const saveChanges = useCallback(async () => {
    await createResourceEntities({
      variables: {
        data: {
          entitiesToCopy: changes.movedEntities,
          modelGroupsResources: changes.newServices,
          projectId: currentProject.id,
        },
      },
    }).catch(console.error);

    resetChanges();
    loadProjectResources();
  }, [resetChanges, changes]);

  return {
    nodes,
    currentResourcesData,
    setNodes,
    selectedNode,
    setSelectedNode,
    edges,
    setEdges,
    onEdgesChange,
    showRelationDetails,
    resourcesData,
    loadingResources,
    resourcesError,
    setSearchPhrase,
    toggleShowRelationDetails,
    resetToOriginalState,
    changes,
    setChanges,
    setDraggableNodes,
    saveChanges,
    moveNodeToParent,
    createNewTempService,
    modelGroupFilterChanged,
    searchPhraseChanged,
    mergeNewResourcesChanges,
  };
};

export default useModelOrganization;
