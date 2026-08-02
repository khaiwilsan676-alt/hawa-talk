// By setting isLocalUpdate.current = false in the onSnapshot callback without updating the state
// IF we skip the state update because it was a local change, we DO set isLocalUpdate.current = false,
// But the issue might be that onSnapshot is triggered MULTIPLE times.
