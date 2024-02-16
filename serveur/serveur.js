const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs')
const cors = require('cors')
app.use(cors())

const sqlite3 = require('sqlite3');											      																										 
const { open } = require('sqlite');

let db;

// this is a top-level await 
(async () => {
	try {
		// open the database
	    db = await open({
	      filename: './database.db',
	      driver: sqlite3.Database
	    })

	    await db.exec('DROP TABLE voitures')
	    await db.exec(`CREATE TABLE voitures (
	    	nom VARCHAR(100) NOT NULL,
	    	image TEXT NOT NULL, 
	    	pays VARCHAR (30)

	    )`)


	    const voituresJson = fs.readFileSync('../voitures.json', "utf8");
	    const voitures = JSON.parse(voituresJson);

	    for (const voiture of voitures) {
	    	await db.exec(`
	    		INSERT INTO voitures (nom, image, pays)
	    		VALUES ("${voiture.nom}", "${voiture.image}", "${voiture.pays}")`)
	    }
	      
	} catch (error) {
		console.log(error);
	}
})()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/cars', async (req, res) => {
    const Cars = await db.all("SELECT nom, image, pays FROM voitures")
	  //console.log('Cars', Cars)
	  res.json(Cars)
})

app.get('/cars-add', async (req, res) => {
	try {
		const query = `INSERT INTO voitures (nom, image, pays) VALUES ("${req.query.nom}", "${req.query.lien}","${req.query.Pays}")`;
		console.log(query);
		await db.exec(query)
	} catch (error) {
			console.log(error);
			res.send(error);
			return;
		}
		
	  res.send('ok'+req.query.nom+req.query.lien+req.query.Pays);
})

app.get('/car', async (req, res) => {
	const car = await db.get(`SELECT * FROM voitures WHERE nom = "${req.query.nom}"`)
  res.json(car);
})

app.get('/car-update', async (req, res) => {
	const nom = req.query.nom;
	const lien = req.query.lien;
	const nouveauNom = req.query.nouveauNom;
	const Pays = req.query.Pays
	try {
		await db.exec(`
			UPDATE voitures
			SET nom = "${nouveauNom}", image = "${lien}", pays = "${Pays}"
			WHERE nom = "${nom}"
		`)
	} catch (error) {
		console.log(error);
		res.send(error);
	}

	res.send("ok");
})

app.get('/supprimer-voiture', async (req, res) => {
	const nom = req.query.nom;
	await db.exec(`
			DELETE FROM voitures
			WHERE nom = "${nom}"
		`)
	res.send("ok");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
