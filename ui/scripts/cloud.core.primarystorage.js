 /**
 *  Copyright (C) 2010 Cloud.com, Inc.  All rights reserved.
 * 
 * This software is licensed under the GNU General Public License v3 or later.
 * 
 * It is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */
 
 function afterLoadPrimaryStorageJSP($midmenuItem1) {
    initAddHostButton($("#midmenu_add_link"), "primarystorage_page"); 
    initAddPrimaryStorageButton($("#midmenu_add2_link"), "primarystorage_page");  
    
    initDialog("dialog_add_host");
    initDialog("dialog_add_pool");
    initDialog("dialog_confirmation_delete_primarystorage");
        
    primarystorageJsonToDetailsTab($midmenuItem1); 
}

function primarystorageGetMidmenuId(jsonObj) {
    return "midmenuItem_primarystorage_" + jsonObj.id; 
}

function primarystorageToMidmenu(jsonObj, $midmenuItem1) {    
    $midmenuItem1.attr("id", primarystorageGetMidmenuId(jsonObj));  
    $midmenuItem1.data("jsonObj", jsonObj);      
    
    var $iconContainer = $midmenuItem1.find("#icon_container").show(); 
    $iconContainer.find("#icon").attr("src", "images/midmenuicon_primarystorage.png");    
      
    $midmenuItem1.find("#first_row").text(fromdb(jsonObj.name).substring(0,25)); 
    $midmenuItem1.find("#second_row").text(jsonObj.ipaddress.substring(0,25));          
}

function primarystorageToRightPanel($midmenuItem1) {  
    copyActionInfoFromMidMenuToRightPanel($midmenuItem1);         
    resourceLoadPage("jsp/primarystorage.jsp", $midmenuItem1);
}

function primarystorageJsonToDetailsTab($midmenuItem1) {	
    var jsonObj = $midmenuItem1.data("jsonObj");    
    var $detailsTab = $("#tab_content_details");   
    $detailsTab.data("jsonObj", jsonObj);           
    $detailsTab.find("#id").text(fromdb(jsonObj.id));
    $detailsTab.find("#grid_header_title").text(fromdb(jsonObj.name));
    $detailsTab.find("#name").text(fromdb(jsonObj.name));
    
    setHostStateInRightPanel(fromdb(jsonObj.state), $detailsTab.find("#state"));
    
    $detailsTab.find("#zonename").text(fromdb(jsonObj.zonename));
    $detailsTab.find("#podname").text(fromdb(jsonObj.podname));
    $detailsTab.find("#clustername").text(fromdb(jsonObj.clustername));
	var storageType = "ISCSI Share";
	if (jsonObj.type == 'NetworkFilesystem') storageType = "NFS Share";
    $detailsTab.find("#type").text(storageType);
    $detailsTab.find("#ipaddress").text(fromdb(jsonObj.ipaddress));
    $detailsTab.find("#path").text(fromdb(jsonObj.path));                
	$detailsTab.find("#disksizetotal").text(convertBytes(jsonObj.disksizetotal));
	$detailsTab.find("#disksizeallocated").text(convertBytes(jsonObj.disksizeallocated));
	$detailsTab.find("#tags").text(fromdb(jsonObj.tags));   
	
	//actions ***   
    var $actionLink = $detailsTab.find("#action_link"); 
    $actionLink.bind("mouseover", function(event) {	    
        $(this).find("#action_menu").show();    
        return false;
    });
    $actionLink.bind("mouseout", function(event) {       
        $(this).find("#action_menu").hide();    
        return false;
    });	  
    var $actionMenu = $detailsTab.find("#action_link #action_menu");
    $actionMenu.find("#action_list").empty(); 
    buildActionLinkForTab("Enable Maintenance Mode", primarystorageActionMap, $actionMenu, $midmenuItem1, $detailsTab);     
    buildActionLinkForTab("Cancel Maintenance Mode", primarystorageActionMap, $actionMenu, $midmenuItem1, $detailsTab);     
    buildActionLinkForTab("Delete Primary Storage", primarystorageActionMap, $actionMenu, $midmenuItem1, $detailsTab);        
}
       
function primarystorageClearRigntPanel() {  
    primarystorageJsonClearDetailsTab(jsonObj);  
}

function primarystorageJsonClearDetailsTab() {	    
    var $detailsTab = $("#tab_content_details");   
    $detailsTab.find("#id").text("");
    $detailsTab.find("#name").text("");
    $detailsTab.find("#zonename").text("");
    $detailsTab.find("#podname").text("");
    $detailsTab.find("#clustername").text("");
    $detailsTab.find("#type").text("");
    $detailsTab.find("#ipaddress").text("");
    $detailsTab.find("#path").text("");                
	$detailsTab.find("#disksizetotal").text("");
	$detailsTab.find("#disksizeallocated").text("");
	$detailsTab.find("#tags").text("");         
}

var primarystorageActionMap = {
    "Enable Maintenance Mode": {              
        isAsyncJob: true,
        asyncJobResponse: "prepareprimarystorageformaintenanceresponse",
        dialogBeforeActionFn: doEnableMaintenanceModeForPrimaryStorage,
        inProcessText: "Enabling Maintenance Mode....",
        afterActionSeccessFn: function(json, $midmenuItem1, id) {             
            var item = json.queryasyncjobresultresponse.jobresult.storagepool; 
            primarystorageToMidmenu(item, $midmenuItem1);
            primarystorageToRightPanel($midmenuItem1);                        
            $("#right_panel_content #after_action_info").text("We are actively enabling maintenance. Please refresh periodically for an updated status."); 
        }
    },
    "Cancel Maintenance Mode": {              
        isAsyncJob: true,
        asyncJobResponse: "cancelprimarystoragemaintenanceresponse",
        dialogBeforeActionFn: doCancelMaintenanceModeForPrimaryStorage,
        inProcessText: "Cancelling Maintenance Mode....",
        afterActionSeccessFn: function(json, $midmenuItem1, id) {       
            var item = json.queryasyncjobresultresponse.jobresult.storagepool;    
            primarystorageToMidmenu(item, $midmenuItem1);
            primarystorageToRightPanel($midmenuItem1);            
            $("#right_panel_content #after_action_info").text("We are actively cancelling your scheduled maintenance.  Please refresh periodically for an updated status."); 
        }
    },
    "Delete Primary Storage": {              
        isAsyncJob: false,        
        dialogBeforeActionFn: doDeletePrimaryStorage,
        inProcessText: "Deleting Primary Storage....",
        afterActionSeccessFn: function(json, $midmenuItem1, id) {   
            $midmenuItem1.slideUp("slow", function() {
                $(this).remove();
            });   
            clearRightPanel();
            primarystorageClearRightPanel();
        }
    }
}

function doEnableMaintenanceModeForPrimaryStorage($actionLink, $detailsTab, $midmenuItem1){ 
    var jsonObj = $detailsTab.data("jsonObj");
       
    $("#dialog_confirmation")
    .text("Warning: placing the primary storage into maintenance mode will cause all VMs using volumes from it to be stopped.  Do you want to continue?")
    .dialog("option", "buttons", {	                    
         "OK": function() {
             $(this).dialog("close");      
             var id = jsonObj.id;
             var apiCommand = "command=enableStorageMaintenance&id="+id;
    	     doActionToTab(id, $actionLink, apiCommand, $midmenuItem1, $detailsTab);		
         },
         "Cancel": function() {	                         
             $(this).dialog("close");
         }
    }).dialog("open");     
} 

function doCancelMaintenanceModeForPrimaryStorage($actionLink, $detailsTab, $midmenuItem1){ 
    var jsonObj = $detailsTab.data("jsonObj");
       
    $("#dialog_confirmation")
    .text("Please confirm you want to cancel maintenace")
    .dialog("option", "buttons", {	                    
         "OK": function() {
             $(this).dialog("close");      
             var id = jsonObj.id;
             var apiCommand = "command=cancelStorageMaintenance&id="+id;
    	     doActionToTab(id, $actionLink, apiCommand, $midmenuItem1, $detailsTab);		
         },
         "Cancel": function() {	                         
             $(this).dialog("close");
         }
    }).dialog("open");     
} 

function doDeletePrimaryStorage($actionLink, $detailsTab, $midmenuItem1){ 
    var jsonObj = $detailsTab.data("jsonObj");
       
    $("#dialog_confirmation_delete_primarystorage")
    .dialog("option", "buttons", {	                    
         "OK": function() {
             $(this).dialog("close");      
             var id = jsonObj.id;
             var apiCommand = "command=deleteStoragePool&id="+id;
    	     doActionToTab(id, $actionLink, apiCommand, $midmenuItem1, $detailsTab);		
         },
         "Cancel": function() {	                         
             $(this).dialog("close");
         }
    }).dialog("open");     
} 

