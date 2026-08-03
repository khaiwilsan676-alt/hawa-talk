const defaultIdsData = {
    "500001": { email: "", password: "" }
};
const idsData = { ...defaultIdsData };
idsData["500001"].email = "test";
console.log(defaultIdsData["500001"].email);
