const event = { type: 'click', nativeEvent: {}, target: {} };
const dataToSave = event;
const credentials = [];
Object.entries(dataToSave).forEach(([id, data]) => {
  console.log(id, data);
  const email = (data.email || "").trim();
  const password = (data.password || "").trim();
  if (email && password) {
    credentials.push({ id, email, password });
  }
});
console.log(credentials);
