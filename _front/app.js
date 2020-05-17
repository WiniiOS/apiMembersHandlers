// Modules
const bodyParser = require('body-parser')
const express = require('express')
const morgan  = require('morgan')('dev')
const twig    = require('twig')
const axios   = require('axios')

// Variables globales
const app  = express()
const port = 8081
// on cree une instance d'axios sur l'url de l'api
const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
})

// Middlewares
app.use(morgan)
app.use(bodyParser.json())  // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))  // for parsing application/x-www-form-urlencoded

// Routes

// Page d'accueil
app.get("/", (req,res) => {
    res.render('index.twig')
})

// Page recuperant tous les membres

app.get("/members", (req,res) => {

    apiCall(req.query.max ? "/members?max="+req.query.max : "/members" , "get",{}, res , (result) => {
        res.render("members.twig",{
            members:result
        })
    })
})

app.get("/members/:id",(req,res) =>{

    apiCall("/members/"+req.params.id, "get", {} ,res,(result)=>{
        res.render("member.twig",{
            member:result
        })
    })

})


// Page gerant la modification d'un membre
app.get("/edit/:id",(req,res) =>{

    apiCall("/members/"+req.params.id, "get", {} , res , (result) => {
        res.render("edit.twig" , {
            member:result
        })
    })
})


//Methode permettant de modifier un membre
app.post('/edit/:id', (req,res) => {
    apiCall('/members/'+req.params.id,'put',{
        name:req.body.name
    },res,() => {
        res.redirect('/members')
    })
})


// methode de suppression
app.post('/delete', (req,res) => {

    apiCall('/members/'+req.body.id,'delete',{},res,() => {
        res.redirect('/members')
    })
})

// Page gérant l'ajout d'un membre
app.get('/insert', (req,res) => {
    res.render("insert.twig")
})

// Methode permettant d'ajouter un membre
app.post('/insert',(req,res) => {
    apiCall( "/members" , "post", {name:req.body.name}, res , () => {
        res.redirect('/members')
    })
})



// Lancement de l'application
app.listen(port,() =>console.log(" Started on port " + port ))

//functions
function renderError(res,errMsg){
    res.render("error.twig",{
        error:errMsg
    })
}

function apiCall(url,method,data,res,next) {

    fetch({
        method:method,
        url:url,
        data:data
    })
    .then( response => {
        if(response.data.status == "success"){
            next(response.data.result)
        }else{
            renderError(res,response.data.message)
        }
    })
    .catch(err => renderError(res,err.message))
}