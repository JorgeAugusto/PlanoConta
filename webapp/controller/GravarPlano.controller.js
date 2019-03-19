sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(Controller, History, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("br.com.idxtecPlanoConta.controller.GravarPlano", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarplano").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Incluir Nova Conta Contabil",
					codigoEdit: true
				});
				
				var oNovoPlano = {
					"Codigo": "",
					"Descricao": "",
					"ClasseConta": "SINTETICA",
					"Condicao": "CREDORA",
					"Bloqueada": false
				};
				
				oJSONModel.setData(oNovoPlano);
	
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta Contabil",
					codigoEdit: false
				});
					
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView()) === true) {
				MessageBox.information("Preencher todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createPlan();
			} else if (this._operacao === "editar") {
				this._updatePlan();
			}
		},
		
		_goBack: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("planoconta", {}, true);
			}
		},
		
		_createPlan: function() {
			var that = this;
		
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oModel.create("/PlanoContas", oDados, {
				success: function() {
					MessageBox.success("Dados gravados.",{
						onClose: function(sAction) {
							that._goBack();
						}
					});
				},
				error: function(oError) {
					var sError = JSON.parse( oError.responseText).error.message.value; 
					MessageBox.error(sError);
				}
			});
		},
		
		_updatePlan: function() {
			var that = this;
			
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oModel.update(this._sPath, oDados, {
					success: function() {
					MessageBox.success("Dados gravados.", {
						onClose: function() {
							that._goBack();
						}
					});
				},
				error: function(oError) {
					var sError = JSON.parse( oError.responseText).error.message.value; 
					MessageBox.error(sError);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false;
			}
		},
		
		onVoltar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
		
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("planoconta", {}, true);
			}
		}
	});

});