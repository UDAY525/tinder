const express = require('express');
const app = express();

app.use("/hello",(req,res) => {
    res.send('Server Running');
})

app.listen(3000, ()=>{
    console.log('Server is running...')
});