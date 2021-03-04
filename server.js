const app = require('./app');
const port = 3000 || process.env.PORT;

const server = app.listen(port, () => console.log(`listening on ${port}`));
