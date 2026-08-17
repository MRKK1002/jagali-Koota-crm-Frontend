// Utility functions for syncing inventory data with backend

export const syncLocalIndentsWithBackend = async () => {
  try {
    const localIndents = JSON.parse(localStorage.getItem("indents") || "[]");
    const localOnlyIndents = localIndents.filter((indent) => indent.isLocal);

    if (localOnlyIndents.length === 0) {
      return { success: true, synced: 0 };
    }

    let syncedCount = 0;
    const failedSyncs = [];

    for (const indent of localOnlyIndents) {
      try {
        const indentData = {
          material: indent.materialName,
          quantity: indent.quantity,
          urgency: indent.priority,
          phase: "structure", // Default phase
          notes: indent.notes || "",
          requestedBy: indent.requestedBy,
        };

        const response = await fetch(
          "https://crm.jagalikoota.com/api/v1/construction/indents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(indentData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            syncedCount++;
            // Update the local indent with the server ID
            const updatedIndents = localIndents.map((localIndent) =>
              localIndent.id === indent.id
                ? {
                    ...localIndent,
                    id: result.data._id,
                    isLocal: false,
                  }
                : localIndent
            );
            localStorage.setItem("indents", JSON.stringify(updatedIndents));
          }
        } else {
          failedSyncs.push(indent.id);
        }
      } catch (err) {
        console.error(`Failed to sync indent ${indent.id}:`, err);
        failedSyncs.push(indent.id);
      }
    }

    return {
      success: true,
      synced: syncedCount,
      failed: failedSyncs.length,
      failedIds: failedSyncs,
    };
  } catch (err) {
    console.error("Error during sync:", err);
    return { success: false, error: err.message };
  }
};

export const checkBackendConnection = async () => {
  try {
    const response = await fetch(
      "https://crm.jagalikoota.com/api/v1/construction/indents?limit=1",
      { method: "GET" }
    );
    return response.ok;
  } catch (err) {
    return false;
  }
};

export const fetchLatestIndents = async () => {
  try {
    const response = await fetch(
      "https://crm.jagalikoota.com/api/v1/construction/indents"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.success) {
      // Transform backend data to match frontend structure
      const transformedIndents = data.data.map((indent) => ({
        id: indent._id || indent.id,
        materialName: indent.material || indent.materialName,
        quantity: indent.quantity,
        priority: indent.urgency || indent.priority || "normal",
        notes: indent.notes || "",
        status: indent.status,
        requestedBy: indent.requestedBy,
        createdAt: indent.createdAt || new Date().toISOString(),
      }));

      // Merge with local data, prioritizing server data
      const localIndents = JSON.parse(localStorage.getItem("indents") || "[]");
      const localOnlyIndents = localIndents.filter((indent) => indent.isLocal);

      const mergedIndents = [...transformedIndents, ...localOnlyIndents];
      localStorage.setItem("indents", JSON.stringify(mergedIndents));

      return { success: true, data: mergedIndents };
    }

    throw new Error(data.message || "Failed to fetch indents");
  } catch (err) {
    console.error("Error fetching latest indents:", err);
    return { success: false, error: err.message };
  }
};

export const updateIndentStatus = async (id, status, updatedBy = "User") => {
  try {
    const response = await fetch(
      `https://crm.jagalikoota.com/api/v1/construction/indents/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          approvedBy: updatedBy,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        // Update localStorage
        const localIndents = JSON.parse(
          localStorage.getItem("indents") || "[]"
        );
        const updatedIndents = localIndents.map((indent) =>
          indent.id === id ? { ...indent, status } : indent
        );
        localStorage.setItem("indents", JSON.stringify(updatedIndents));

        return { success: true, data: result.data };
      }
    }

    throw new Error("Failed to update indent status");
  } catch (err) {
    console.error("Error updating indent status:", err);

    // Fallback: update locally
    const localIndents = JSON.parse(localStorage.getItem("indents") || "[]");
    const updatedIndents = localIndents.map((indent) =>
      indent.id === id ? { ...indent, status, pendingSync: true } : indent
    );
    localStorage.setItem("indents", JSON.stringify(updatedIndents));

    return { success: false, error: err.message, updatedLocally: true };
  }
};

export const createIndent = async (indentData) => {
  try {
    const response = await fetch(
      "https://crm.jagalikoota.com/api/v1/construction/indents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(indentData),
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        // Transform the response to match frontend structure
        const newIndent = {
          id: result.data._id,
          materialName: result.data.material,
          quantity: result.data.quantity,
          priority: result.data.urgency,
          notes: result.data.notes || "",
          status: result.data.status,
          requestedBy: result.data.requestedBy,
          createdAt: result.data.createdAt,
        };

        // Update localStorage
        const localIndents = JSON.parse(
          localStorage.getItem("indents") || "[]"
        );
        const updatedIndents = [...localIndents, newIndent];
        localStorage.setItem("indents", JSON.stringify(updatedIndents));

        return { success: true, data: newIndent };
      }
    }

    throw new Error("Failed to create indent");
  } catch (err) {
    console.error("Error creating indent:", err);

    // Fallback: save locally with temporary ID
    const localIndent = {
      id: `local_${Date.now()}`,
      materialName: indentData.material,
      quantity: indentData.quantity,
      priority: indentData.urgency,
      notes: indentData.notes || "",
      status: "pending",
      requestedBy: indentData.requestedBy,
      createdAt: new Date().toISOString(),
      isLocal: true, // Flag to indicate this is a local-only record
    };

    const localIndents = JSON.parse(localStorage.getItem("indents") || "[]");
    const updatedIndents = [...localIndents, localIndent];
    localStorage.setItem("indents", JSON.stringify(updatedIndents));

    return {
      success: false,
      error: err.message,
      data: localIndent,
      savedLocally: true,
    };
  }
};
