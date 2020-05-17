const { success,error,checkAndChange } = require('./assets/functions')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const morgan  = require('morgan')('dev')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/swagger.json')
const config  = require('./assets/config')


mysql.createConnection({
    host:config.db.host,
    database:config.db.database,
    user:config.db.user,
    password:config.db.password
})
.then( db =>{
    
    console.log("Connected!")
    const app = express()

    let MembersRouter = express.Router()
    let Members = require('./assets/classes/members_class')(db,config)

    app.use(morgan)
    app.use(bodyParser.json())  // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true }))  // for parsing application/x-www-form-urlencoded
    app.use(config.rootAPI + 'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    MembersRouter.route('/:id')

        // Recupere un membre avec son ID
        .get(async (req,res)=>{
            let member = await Members.getByID(req.params.id)
            res.json(checkAndChange(member))
        })

        // Modififier un membre avec son ID
        .put( async (req,res) =>{
            const updateMember = await Members.update(req.params.id,req.body.name)
            res.json(checkAndChange(updateMember))
        })

        // Supprime un membre avec son ID
        .delete(async (req,res)=>{
            const deleteMember = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMember))
        })

    MembersRouter.route('/')

        // Recupere tous les membres
        .get( async (req,res) => {
            const allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })

        // Ajoute un membre
        .post(async (req,res) => {
            let addMember = await Members.add(req.body.name)
            res.json(checkAndChange(addMember))
        })

    app.use( config.rootAPI + 'members', MembersRouter )
    app.listen(config.port, () => console.log(`Started at http://localhost:${config.port} port`) )


}).catch ( err => {

    console.log('error during database connection',err.message)
})