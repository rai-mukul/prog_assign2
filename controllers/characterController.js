// controllers/characterController.js
const { v1: uuidv1 } = require('uuid'); // Used to generate UUIDs for nodes
const neo4j = require('neo4j-driver');

// Create a new character
const createCharacter = async (req, res) => {
  const { name, height, mass, skin_colors, hair_colors, eye_colors, birth_year, gender, homeworld, species } = req.body;
  const session = req.driver.session();
  
  try {
    const result = await session.run(
      `
      CREATE (c:Character { 
        id: $id,
        name: $name, 
        height: $height, 
        mass: $mass, 
        skin_colors: $skin_colors, 
        hair_colors: $hair_colors, 
        eye_colors: $eye_colors, 
        birth_year: $birth_year, 
        gender: $gender, 
        homeworld: $homeworld, 
        species: $species 
      })
      RETURN c
      `,
      {
        id: uuidv1(),
        name,
        height,
        mass,
        skin_colors,
        hair_colors,
        eye_colors,
        birth_year,
        gender,
        homeworld,
        species
      }
    );

    const createdCharacter = result.records[0].get('c').properties;
    res.status(201).json(createdCharacter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};

// Update a character by name
const updateCharacter = async (req, res) => {
  const { name } = req.params;
  const { hair_colors, height, birth_year } = req.body;
  const session = req.driver.session();
  
  try {
    const result = await session.run(
      `
      MATCH (c:Character { name: $name })
      SET c.hair_colors = $hair_colors,
          c.height = $height,
          c.birth_year = $birth_year
      RETURN c
      `,
      { name, hair_colors, height, birth_year }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const updatedCharacter = result.records[0].get('c').properties;
    res.json(updatedCharacter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};

// Delete a character by name
const deleteCharacter = async (req, res) => {
  const { name } = req.params;
  const session = req.driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Character { name: $name })
      DELETE c
      RETURN COUNT(c) AS deletedCount
      `,
      { name }
    );

    const deletedCount = result.records[0].get('deletedCount').toNumber();
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};

// Get all characters
const getAllCharacters = async (req, res) => {
  const session = req.driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Character)
      RETURN c
      `
    );

    const characters = result.records.map(record => record.get('c').properties);
    res.json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};

// Get a character by name
const getCharacterByName = async (req, res) => {
  const { name } = req.params;
  const session = req.driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c:Character { name: $name })
      RETURN c
      `,
      { name }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const character = result.records[0].get('c').properties;
    res.json(character);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};

module.exports = {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getAllCharacters,
  getCharacterByName,
};
