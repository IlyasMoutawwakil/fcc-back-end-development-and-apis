require('dotenv').config();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const { Schema } = mongoose;

const personSchema = new Schema({
    name:  {type: String, required: true},
    age: {type: Number},
    favoriteFoods: [String]
  });

const Person = mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
  person = Person({name: "Ilyas Moutawwakil", age: 21, favoriteFoods: ['Something', 'Something else']})
  person.save((err, data) => {
    if (err) return console.error(err);
    console.log(data)
    done(null, data)})
};

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, data) => {
    if (err) return console.error(err);
    console.log(data)
    done(null, data)
    })
};

const findPeopleByName = (personName, done) => {
  Person.find({name: personName}, (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    done(null, data)
  })
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    done(null, data)
  })
};

const findPersonById = (personId, done) => {
  Person.findById(personId, (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    done(null, data)
  })
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findById(personId, (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    data.favoriteFoods.push(foodToAdd);
    console.log(data);
    data.save((err_, data_) => {
      if (err_) return console.error(err_);
      console.log(data_)
      done(null, data_)
    })
  })
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;
  Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}, (err, data) => {
    if(err) return console.log(err);
    console.log(data);
    done(null, data);
  })
};

const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId,
  (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    done(null, data);
  })
};

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name: nameToRemove},
  (err, data) => {
    if (err) return console.log(err);
    console.log(data);
    done(null, data)
  })
};

const queryChain = (done) => {
  const foodToSearch = "burrito";
  const query = Person.find({favoriteFoods:foodToSearch});
  query.sort({name: 1}).limit(2).select({ age: 0 }).exec(
    (err, data) => {
      if (err) return console.log(err);
      console.log(data);
      done(null, data);
    }
  )
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
