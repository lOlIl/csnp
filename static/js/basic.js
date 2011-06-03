// initialise Fields, Form and Window for next use
function createAppForm(){
    // Form inputs
    txt_nickname = new Ext.form.TextField({
	    fieldLabel: 'Nickname',
	    name: 'nickname',
	    width:190,
        allowBlank:false,
        msgTarget:'side'
        });

    txt_title = new Ext.form.TextField({
	    fieldLabel: 'Title',
	    name: 'title',
	    width:190,
        allowBlank:false,
        msgTarget:'side'
        });

    tar_text = new Ext.form.TextArea({
	    fieldLabel: 'Text',
	    name: 'text',
	    width:440,
        height: 100,
        allowBlank:false,
        minLength: 5, 
        maxLength: 100000,
        msgTarget:'side'
        });

    df_exp_date = new Ext.form.DateField({
	    fieldLabel: 'Expiration date',
	    name: 'exp_date',
	    width:190,
	    allowBlank:false,
	    format:'d.m.Y',
        msgTarget:'side'
        });

    df_exp_time = new Ext.form.TimeField({
        fieldLabel : "Expiration time",
        name: 'exp_time',
        width:100,
        increment  : 30,
        format     : 'H:i',
	    allowBlank:false,
        msgTarget:'side'
        });

    // Form
    post_form = new Ext.FormPanel({
        labelAlign: 'top',
	    frame:true,
        bodyStyle:'padding:5px 5px 0',
        width: 500,
	    buttonAlign:'center',
	    items: 
            [txt_nickname,txt_title,df_exp_date,df_exp_time,tar_text,],    	
	    buttons: 
            [{
	            text: 'Save',
      	        handler: saveForm,
                },{
                text: 'Clear',
      	        handler: clearForm,
		        }		    		 
            ]
        });

    // Window 
    post_window = new Ext.Window({
        id: 'postWindow',
        title:'New Paste Form',
        width: 500,
        height: 430,
        plain:true,
        layout: 'fit',      
        items: post_form,
        closable:true,
        closeAction:'hide',    
        form:  post_form.getForm(),
        }); 
}

// form handler: save the form via AJAX request 
function saveForm(){      
    Ext.Ajax.request({ 
            url: 'paste/new/',
            method:  'GET',  
            params: {
                    title:txt_title.getValue(),                  
                    text :tar_text.getValue(),
                    nickname:txt_nickname.getValue(),
                    exp_time:df_exp_date.getValue().format('d/m/Y') + ' ' + df_exp_time.getValue(),  
            }, 
            success: function(response){              
                var result=eval(response.responseText);
                switch(result){
                case 1:
                    Ext.MessageBox.alert('OK','New paste added.');
                    dataStore.load();
                    break;
                default:
                    Ext.MessageBox.alert('Bad','Could not create new paste. Text too long.');
                    break;
                    }
                clearForm();             
                post_window.hide();
                
                },
            failure: function(response){
                var result=response.responseText;
                Ext.MessageBox.alert('Error','Could not connect to the database' + result);         
                }                      
      });
}

// form handler: form cleaner
function clearForm(show){
    txt_nickname.setValue('');       
    txt_title.setValue('');  
    tar_text.setValue('');
    df_exp_date.setValue('');  
    df_exp_time.setValue(''); 

    if (show)
	    Ext.Msg.alert('Success', 'Your form has been cleaned!.');
    }

// DataStore
function createDataStore(){
    dataStore = new Ext.data.JsonStore({
        url: 'paste/all/',
        root: 'items',
        fields: [
                    'weblink', 
		            'nickname',
		            'exp_time',
                    'pub_time',
                    'title'
                ], 
        autoLoad: true
        });

    }

// create the url to load the data from 
// default search by both
function searchBy(what,title,author){
    url = 'paste/search/?find='+what;
    if (title)  
        url += '&title=true';
    else if (author)
        url += '&author=true';
    dataStore.proxy.conn.url = url;
    dataStore.load();                  
    }

// Grid
function createGrid(){
    grid = new Ext.grid.GridPanel({
        store : dataStore,
        columns: [
                    {header: 'Published Time', width: 100, sortable: true,                dataIndex: 'pub_time'}, 
                    {header: 'Expiration Time', width: 150, sortable: true, hidden:true,  dataIndex: 'exp_time'},
                    {header: 'Author', width: 75, sortable: true, hidden:true,          dataIndex: 'nickname'},
                    {header: 'Weblink', width: 150, sortable: true,                      dataIndex: 'weblink'},    
                    {header: 'Title', width: 50, sortable: true,                         dataIndex: 'title'},
               ],
            
        viewConfig: {
            forceFit: true
            },

        renderTo: 'table',
        title: 'All application pastes',
        width:750,
        autoHeight: true,
        frame:true,
        tbar:[{
                text:'Add Post',
                tooltip:'Add a new post record',
                iconCls:'add',  
                listeners:{'click':function(){ post_window.show(); }}
               },
            new Ext.Toolbar.TextItem ("Search For:"),
                    {
                        xtype:'textfield',
                        fieldLabel:'Search',
                        width:75,
                        name: 'pattern',
                        id:'pattern',
                    },
                    {
                        text:'By author',
                        tooltip:'Search for pasters records by author',
                        iconCls:'add',  
                        listeners:{'click':function(){ 
                            var text = Ext.get('pattern').getValue();
                            if (text != '')
                                searchBy(text, title=false, author=true);
                            else Ext.Msg.alert('Search error', 'Empty search pattern!.');
                            }}
                    },
                    {
                        text:'By title',
                        tooltip:'Search for pastes records by title',
                        iconCls:'add',  
                        listeners:{'click':function(){
                            var text = Ext.get('pattern').getValue();
                            if (text != '')
                                searchBy(text, title=true, author=false );
                            else Ext.Msg.alert('Search error', 'Empty search pattern!.'); 
                            }}
                    },
                    {
                        text:'By both',
                        tooltip:'Search for pastes records by both - author OR title',
                        iconCls:'add',  
                        listeners:{'click':function(){
                            var text = Ext.get('pattern').getValue();
                            if (text != '')
                                searchBy(text,title=false, author=false);
                            else Ext.Msg.alert('Search error', 'Empty search pattern!.'); 
                            }}
                    },
                    {
                        text:'Refresh pastes',
                        tooltip:'Show all post records in database',
                        iconCls:'add',  
                        listeners:{'click':function(){ 
                            dataStore.proxy.conn.url = 'paste/all/';
                            dataStore.load();               
                            }}
                    },
                
                ],
        });
}

// simple paste detail into panel
function createPasteDetail(){
    
    bookTplMarkup = [
        '<div>{title}</div><br/>',
        '<div>by author: {nickname} published: {pub_time} expires: {exp_time} </div><br/>',
        ];
    bookTpl = new Ext.Template(bookTplMarkup);

    // basic more detailed panel
    detailWindow = new Ext.Panel({
        id: 'detail',
        width: 750,
        title:'Paste basic overview',        
        plain:true,
        layout: 'fit',      
        closable:true,
        closeAction:'hide',
        renderTo: 'detail',
        items:[{
            id: 'detailPanel',
            region: 'center',
            autoHeight:true,
            bodyStyle: {
                background: '#ffffff',
                padding: '7px'
            },
            html: 'Choose a weblink to be shown.'           
            }] ,
        tbar: [{
            // show more details of Paste
            text: 'More details',
            handler: function(){
                    detailMoreWindow.show();
                    }
             
                }]
        });
    detailWindow.hide();
}

// show full paste in a new window
function createPasteMoreDetail(){

    detailMoreTplMarkup = [
        '<b>{title}</b><br>',
        '<div>This paste by {nickname}<br/>',
        'Published on: {pub_time}<br/>',
        'Expiration time till: {exp_time} </div><br/>',
        '<div>The text of Paste:</div><br>{text}'
        ];

    detailMoreTpl = new Ext.Template(detailMoreTplMarkup);

    detailMorePanel = new Ext.FormPanel({
        id: 'detail',
        width: 750,
        frame: true,
        items:[{
            id: 'myDetail',
            region: 'center',
            autoHeight:true,
            bodyStyle: {
                background: '#ffffff',
                padding: '7px'
            },
            html: 'Choose a weblink to be shown.'           
            }]
        });

    detailMoreWindow = new Ext.Window({
        id: 'moreWindow',
        title:'Detail of paste',
        width: 500,
        height: 430,
        plain:true,
        layout: 'fit',      
        items: detailMorePanel,
        closable:true,
        closeAction:'hide', 
        });

        // store for only just one paste, the User selected
    detailStore = new Ext.data.JsonStore({
        root: 'items',
        fields: ['weblink','nickname','exp_time','pub_time','title','text'],
        url:'',
        autoLoad: true
        });
    
    // onload the data, refresh the template content
    detailStore.on('load',function(dataStore,records,options) {
    if (records.length > 0) {
        var thisrec = detailStore.getAt(0);
        var myRec = new Object();
        myRec.title =     thisrec.get('title');
        myRec.text =      thisrec.get('text');
        myRec.nickname =  thisrec.get('nickname');
        myRec.pub_time =  thisrec.get('pub_time');
        myRec.exp_time =  thisrec.get('exp_time');

        var dp = Ext.getCmp('myDetail');
        detailMoreTpl.overwrite(dp.body, myRec);
        }
    },this);
}

Ext.onReady(function() {

    Ext.QuickTips.init();

    createAppForm();
    createDataStore();

    post_window.show();

    createGrid();
    createPasteDetail();
    createPasteMoreDetail();

    grid.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
        var detailPanel = Ext.getCmp('detailPanel');
        var rec = grid.getStore().getAt(rowIdx);

        // ! important for more detailed show
        recordUrl = rec.data.weblink;

        detailStore.proxy.conn.url = recordUrl; 
        detailStore.load();

        bookTpl.overwrite(detailPanel.body, rec.data);
        detailWindow.show();

        });
});
