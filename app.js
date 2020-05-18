//Budget Controller
var budgetController = (function(){

    var Expenses = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expenses.prototype.calPer = function(totalInc){
        if(totalInc > 0){
            this.percentage = Math.round((this.value/totalInc)*100);
        }
        else{
            this.percentage = -1;
        }
    }

    Expenses.prototype.getPer = function(){
        return this.percentage;
    }
    
    var Incomes = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems : {
            exp:[],
            inc:[]
        },
        total : {
            exp:0,
            inc:0
        },
        budget : 0,
        percentage : 0
    }

    var calTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;            
        });

        data.total[type] = sum;
    }
    return{
        addItem : function(type,desc,val){
            var ID,newItem;
            //Create New ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            }
            else{
                ID = 0;
            }
    
            //Create Income or Expense object
            if(type === 'exp'){
                newItem = new Expenses(ID,desc,val);
            }
            else{
                newItem = new Incomes(ID,desc,val);
            }
            
            //Adding new element
            data.allItems[type].push(newItem);
            //Return new Item
            return newItem;
        },

        calculatePercentage: function(){

            data.allItems.exp.forEach(function(curr){
                curr.calPer(data.total.inc);
            });

        },

        getPercentage: function(){

            var allPer = data.allItems.exp.map(function(curr){
                return curr.getPer();
            });
            return allPer;
        },

        deleteItem: function(type,id){
            var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },

        budgetCal : function(){
            //Calculate total income and expenses
            calTotal('inc');
            calTotal('exp');

            //Calculate budget
            data.budget = data.total.inc - data.total.exp;

            //Calculate percentage
            if(data.total.inc > 0 ){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
            

        },
        getBudget : function(){
            return {
                budget: data.budget,
                totalIncome: data.total.inc,
                totalExpense: data.total.exp,
                percentage: data.percentage
            };
        },
        testing : function(){
            console.log(data);
        }
    }
    
})();

//UI Controller
var UIController = (function(){

    var DomStrings = {
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue: '.add__value',
        inputButton:'.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetVal : '.budget__value',
        budgetIncome : '.budget__income--value',
        budgetExpense : '.budget__expenses--value',
        expensePercentage : '.budget__expenses--percentage',
        container: '.container',
        expensesPer : '.item__percentage',
        dataLabel : '.budget__title--month'
    }

    var formatNumber = function(num,type){
        var numSplit,sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3); 
        }
        dec = numSplit[1];
        type === 'inc' ? sign = '+' : sign = '-';
        return sign + ' '  + int + '.' + dec;
    }

    var nodeListForEach = function(list,callback){
        for(var i =0; i<list.length;i++){
            callback(list[i],i);
        }
    }

    return{
        getInput: function(){
            return{
                type: document.querySelector(DomStrings.inputType).value,
                description : document.querySelector(DomStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DomStrings.inputValue).value)
            };
        },
        getDomString : function(){
            return DomStrings;
        },
        addListItem : function(obj,type){
            var html,newHtml,element;
            //Create html
            
            if(type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } 
            else{
                element = DomStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'            
            }

            //new html
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Add html to UI
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields,fieldArr;
            fields = document.querySelectorAll(DomStrings.inputDescription+ ', '+DomStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function(current,index,array){
                current.value = '';
            });
            fieldArr[0].focus();
        },
        updateUI : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetVal).textContent = formatNumber(obj.budget,type);
            document.querySelector(DomStrings.budgetIncome).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DomStrings.budgetExpense).textContent = formatNumber(obj.totalExpense,'exp');
            if(obj.percentage > 0){
                document.querySelector(DomStrings.expensePercentage).textContent = obj.percentage+'%';
            }
            else{
                document.querySelector(DomStrings.expensePercentage).textContent = '---';
            }
        },
        displayMonth : function(){

            var now,year,month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

            document.querySelector(DomStrings.dataLabel).textContent = months[month] + ' ' +year;

        },

        changeUI : function(){

            var fields = document.querySelectorAll(DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue);
            nodeListForEach(fields,function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DomStrings.inputButton).classList.toggle('red');

        },

        displayPerc : function(percenatages){
            
            var nodeList = document.querySelectorAll(DomStrings.expensesPer);

            nodeListForEach(nodeList,function(curr,index){

                if(percenatages[index] > 0){
                    curr.textContent = percenatages[index] + '%';
                }
                else{
                    curr.textContent = '---';
                }
                
            });
        }

    }
       

})();


//Global App Controller
var controller = (function(budgetCtrl,UICtrl){
        var setupEventListeners = function(){
        var DOM = UICtrl.getDomString();
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeUI);
    }
    
    var ctrlAddItem = function(){
        var input,newItem;
        //Get Input
        input = UICtrl.getInput();
        if(input.description !== "" && input.value > 0 && !isNaN(input.value)){
            //Add item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //Add item to UI
            UICtrl.addListItem(newItem,input.type);

            //Clear Fields
            UICtrl.clearFields();

            //Calculate budget and display it
            calBudget();

            //Update Percentages
            updatePercentages();
        }              

    }

    var ctrlDeleteItem = function(event){
        var itemId,splitId,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemId);
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //Delete item from data structure
            budgetCtrl.deleteItem(type,ID);

            //Delete item from UI
            UICtrl.deleteListItem(itemId);

            //Update and show Budget
            calBudget();         
            
            //Update percentages
            updatePercentages();
        }
    }

    var calBudget = function(){
        
        //Calculate the budget
        budgetCtrl.budgetCal();
        //Return Budget
        var budget = budgetCtrl.getBudget();
        //Display the budget on the UI
        UICtrl.updateUI(budget);
    }

    var updatePercentages = function(){
        //Calculate percentages
        budgetCtrl.calculatePercentage();
        //Take percentages from budget controller
        percenatages = budgetCtrl.getPercentage();
        //Update percentage on UI
        UICtrl.displayPerc(percenatages);
    }


    return{
        init: function(){
            console.log('The App has been started');
            UICtrl.displayMonth();
            UICtrl.updateUI({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();