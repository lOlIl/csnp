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
        format     : 'H:i'
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
                    break;
                default:
                    Ext.MessageBox.alert('Bad','Could not create new paste.' + result);
                    break;
                    }
                post_window.hide();
                clearForm(show=False);                

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

Ext.onReady(function() {

    createAppForm();
    post_window.show();

});
