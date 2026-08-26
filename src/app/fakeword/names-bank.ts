// English name banks for the English name generator (英文名生成).
// Split by gender; each entry is a common first or last name.

export type NameGender = "male" | "female" | "any";

export interface EnglishNameBank {
  male: { first: string[]; last: string[] };
  female: { first: string[]; last: string[] };
}

export const ENGLISH_NAME_BANK: EnglishNameBank = {
  male: {
    first: [
      "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
      "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
      "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian",
      "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan",
      "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin",
      "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Frank", "Alexander",
      "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Henry",
      "Douglas", "Peter", "Adam", "Nathan", "Zachary", "Walter", "Harold",
    ],
    last: [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
      "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
      "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
      "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
      "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
      "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans",
      "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
    ],
  },
  female: {
    first: [
      "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan",
      "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Sandra", "Margaret",
      "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda",
      "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura",
      "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda",
      "Pamela", "Nicole", "Emma", "Samantha", "Katherine", "Christine", "Debra",
      "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria", "Heather",
      "Diane", "Virginia", "Julie", "Joyce", "Victoria", "Olivia", "Kelly",
    ],
    last: [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
      "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
      "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
      "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
      "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
      "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans",
      "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
    ],
  },
};
