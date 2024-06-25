/* APIROUTE */

//IMPORTS
const model = require('./model');
const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

//cors
var cors = require('cors');
var corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
}
router.use(cors())

//REQUESTS MANAGER
//Create word
router.post('/word', (req, res) => {
    let name = req.body.name;
    let role = req.body.role;
    let english = req.body.english;
    let ethimology = req.body.ethimology;
    let description = req.body.description;
    let tempword = model.newWord();
    tempword.name = name;
    tempword.role = role;
    tempword.english = english;
    tempword.ethimology = ethimology;
    tempword.description = description;
    model.dbaddWord(tempword);
    const jsonContent = JSON.stringify(tempword);
    res.status(201).end(jsonContent);
});

//Word info
//Get words list in a page
router.get('/word/all', async (req, res) => {
    try {
        const wordCount = await model.Word.count();
        const words = await model.Word.findAll({
            order: [['name', 'ASC']]
        });
        const data = {
            wordsList: words,
            wordsCount: wordCount
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching all words:", error);
        res.status(500).send('Error retrieving word list', error);
    }
});

//Get array of words relative to the array of given names
router.get('/word', async (req, res) => {
    const list = req.body.list || [];
    console.log(list);
    try {
        const words = await model.Word.findAll({
          where: {
            name: {
              [Sequelize.Op.in]: list,
            },
          },
        });
        const data = {
            wordsList: words
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching specific words:", error);
        res.status(500).send('Error retrieving words list', error);
    }
});

//Delete word
router.delete('/word/:name', (req, res) => {
    const param = req.params.name.toLowerCase();
    
    model.Word.findOne({ where: { name: param } }).then(word => {
        if (!word) {
            return res.status(404).send('Word not found');
        } else {
            word.destroy();
            res.status(200).send('Word deleted successfully');
        }
    }).then(() => {}).catch(error => {
        console.error("Error deleting word:", error);
        res.status(500).send('Error deleting word');
    });    
});

//Update/Edit word
router.put('/word/:name',  (req, res) => {
    const param = req.params.name.toLowerCase();
    const newname = req.body.name;
    const newrole = req.body.role;
    const newenglish = req.body.english;
    const newethimology = req.body.ethimology;
    const newdescription = req.body.description;

    model.Word.findOne({ where: { name: param } }).then(word => {
        if (!word) {
            return res.status(404).send('Word not found');
        }
        word.name = newname;
        word.role = newrole;
        word.english = newrole;
        word.ethimology = newethimology;
        word.description = newdescription;
        return word.save();
    }).then(() => {
        res.status(200).send('Word updated successfully');
    }).catch(error => {
        console.error("Error updating word:", error);
        res.status(500).send('Error updating word');
    });
});

router.get('*', (req, res) => {
    res.status(400).send("Nope, this request doesn't exist");
});

//EXPORTS ROUTES
module.exports = router;