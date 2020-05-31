//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
mongoose.set('useFindAndModify', false);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-raghu:Test123@cluster0-infww.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true});
const itemsSchema=new mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to TodoList"
});
const item2=new Item({
  name:"Hit + to add new item"
});
const item3=new Item({
  name:"select check box to remove"
});

const customListItemsSchema=new mongoose.Schema({
  name:String,
  individualList:[itemsSchema]
});
const defaultItems=[item1,item2,item3];
const List=mongoose.model("List",customListItemsSchema);




app.get("/", function(req, res) {
  Item.find(function(err,foundItems){
    if(err){console.log(err);}
    else{
      if(foundItems.length==0)
      {
        Item.insertMany(defaultItems,function(err){
          if(err){console.log(err);}
          else{
            console.log("success");
          }
        });
        res.redirect("/")
      }else{res.render("list", {listTitle:"Today", newListItems: foundItems});}

    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
const listName=req.body.list;

const addItem=new Item({
  name:itemName
});
  if (listName === "Today") {
    addItem.save()
    res.redirect("/");
  } else {
   List.findOne({name:listName},function(err,foundList){
     foundList.individualList.push(addItem);
     foundList.save();
     res.redirect("/"+listName);
   });

  }
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  console.log(listName);
  if(listName==="Today")
  {

    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err)
      {
        console.log("done");
        res.redirect("/");

      }
      else{
        console.log("success");
      }

    });
  }else{
    console.log("done2");
    List.findOneAndUpdate({name:listName},{$pull : {individualList :{_id: checkedItemId}}},function(err,foundList){
if(!err){  res.redirect("/"+listName);}

    });
  }
});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
app.get("/:customListName",function(req,res){
  const customListName=req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){

    if(!err)
    {
      if(!foundList)
      {
        const customlist=new List({
          name:customListName,
          individualList:defaultItems
        });
        customlist.save();
        res.redirect("/"+customListName);
      }else
      {
        res.render("list",{listTitle:foundList.name,newListItems:foundList.individualList});
      }
    }
  });

});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
