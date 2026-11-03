
let users = [{name:"ashish",email:"a@a.com"},{name:"sohan",email:"s@s.com"}]


function greet(user){
  console.log(`hello  ajshfjksdf jk :${user.name}`);
  if(user.name === "ashish") return false;
  return true;
}


users = users.filter(greet)

console.log(users);
