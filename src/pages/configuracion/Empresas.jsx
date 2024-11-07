import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { FileUpload } from 'primereact/fileupload';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { empresaModelo, ConsultarEmpresa, GuardarEmpresa } from '../../servicios/configuracion/Empresa';

const Empresas = () => {
    const [empresas, setEmpresas] = useState([
        {
            id: 1,
            nombreComercial: "DISTRIBUIDORA GMC",
            razonSocial: "MORENO CORDOVA GIOVANNY MANUEL",
            identificacion: "0908670441001",
            idTipoEmpresa: 1,
            tipoEmpresa: "Personal Natural (Contabiliza con RUC)",
            idProvincia: 1,
            provincia: "GUAYAS",
            idCiudad: 1,
            ciudad: "GUAYAQUIL",
            direccion: "Cdla 9 de Octubre Calle: Sexta Num 400 interseccion calle Tercera Referencia: FRENTE A",
            telefono: "0997957060",
            correo: "gmmoreno@hotmail.es",
            inicioActividad: "2002-03-06",
            inicioActividadTexto: "06/03/2002",
            logoRuta: "",
            estado: true
        },
        {
            id: 2,
            nombreComercial: "FARMACIA CRUZ AZUL",
            razonSocial: "FARMACIAS Y COMISARIATOS DE MEDICINAS SA FARCOMED",
            identificacion: "1790951542001",
            idTipoEmpresa: 2,
            tipoEmpresa: "Persona Jurídica",
            idProvincia: 1,
            provincia: "GUAYAS",
            idCiudad: 1,
            ciudad: "GUAYAQUIL",
            direccion: "Av. Francisco de Orellana y Justino Cornejo",
            telefono: "042284505",
            correo: "info@cruazul.com.ec",
            inicioActividad: "1990-05-15",
            inicioActividadTexto: "15/05/1990",
            logoRuta: "",
            estado: true
        },
        {
            id: 3,
            nombreComercial: "SANA SANA",
            razonSocial: "ECONOFARM S.A.",
            identificacion: "1791715772001",
            idTipoEmpresa: 2,
            tipoEmpresa: "Persona Jurídica",
            idProvincia: 2,
            provincia: "PICHINCHA",
            idCiudad: 2,
            ciudad: "QUITO",
            direccion: "Av. 10 de Agosto N37-288 y Villalengua",
            telefono: "023998200",
            correo: "info@sanasana.com.ec",
            inicioActividad: "1995-08-20",
            inicioActividadTexto: "20/08/1995",
            logoRuta: "",
            estado: true
        }
    ]);
    const [empresaDialog, setEmpresaDialog] = useState(false);
    const [deleteEmpresaDialog, setDeleteEmpresaDialog] = useState(false);
    const [empresa, setEmpresa] = useState(empresaModelo);
    const [selectedEmpresas, setSelectedEmpresas] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const fileUploadRef = useRef(null);

    const tiposEmpresa = [
        { label: 'Personal Natural (Contabiliza con RUC)', value: 1 },
        { label: 'Persona Jurídica', value: 2 }
    ];

    const provincias = [
        { label: 'GUAYAS', value: 1 },
        { label: 'PICHINCHA', value: 2 }
    ];

    const ciudades = [
        { label: 'GUAYAQUIL', value: 1 },
        { label: 'QUITO', value: 2 }
    ];

    // Remove the useEffect that fetches data since we're using static data now

    const openNew = () => {
        setEmpresa(empresaModelo);
        setLogoFile(null);
        setSubmitted(false);
        setEmpresaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEmpresaDialog(false);
    };

    const hideDeleteEmpresaDialog = () => {
        setDeleteEmpresaDialog(false);
    };

    const saveEmpresa = async () => {
        setSubmitted(true);

        if (empresa.nombreComercial.trim()) {
            let _empresas = [...empresas];
            let _empresa = {...empresa};
            
            if (empresa.id) {
                const index = _empresas.findIndex(e => e.id === empresa.id);
                _empresas[index] = _empresa;
                toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Empresa actualizada', life: 3000 });
            } else {
                _empresa.id = _empresas.length + 1;
                _empresas.push(_empresa);
                toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Empresa creada', life: 3000 });
            }

            setEmpresas(_empresas);
            setEmpresaDialog(false);
            setEmpresa(empresaModelo);
        }
    };

    const editEmpresa = (empresa) => {
        setEmpresa({ ...empresa });
        setEmpresaDialog(true);
    };

    const confirmDeleteEmpresa = (empresa) => {
        setEmpresa(empresa);
        setDeleteEmpresaDialog(true);
    };

    const deleteEmpresa = () => {
        let _empresas = empresas.filter(val => val.id !== empresa.id);
        setEmpresas(_empresas);
        setDeleteEmpresaDialog(false);
        setEmpresa(empresaModelo);
        toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Empresa eliminada', life: 3000 });
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(empresas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
        XLSX.writeFile(workbook, "empresas.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF('p', 'pt');
        doc.autoTable({
            head: [['Nombre Comercial', 'Razón Social', 'RUC', 'Teléfono', 'Correo']],
            body: empresas.map(empresa => [
                empresa.nombreComercial,
                empresa.razonSocial,
                empresa.identificacion,
                empresa.telefono,
                empresa.correo
            ]),
        });
        doc.save('empresas.pdf');
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _empresa = { ...empresa };
        _empresa[`${name}`] = val;
        setEmpresa(_empresa);
    };

    const onDateChange = (e, name) => {
        let _empresa = { ...empresa };
        _empresa[`${name}`] = e.value;
        _empresa[`${name}Texto`] = e.value ? e.value.toLocaleDateString('es-ES') : '';
        setEmpresa(_empresa);
    };

    const onLogoSelect = (e) => {
        if (e.files && e.files[0]) {
            setLogoFile(e.files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                let _empresa = { ...empresa };
                _empresa.logoRuta = e.target.result;
                setEmpresa(_empresa);
            };
            reader.readAsDataURL(e.files[0]);
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button icon="pi pi-file-excel" className="p-button-help mr-2" onClick={exportExcel} />
                <Button icon="pi pi-file-pdf" className="p-button-warning" onClick={exportPDF} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editEmpresa(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteEmpresa(rowData)} />
            </>
        );
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Gestión de Empresas</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const empresaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveEmpresa} />
        </React.Fragment>
    );

    const deleteEmpresaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpresaDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteEmpresa} />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />

            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable
                    ref={dt}
                    value={empresas}
                    selection={selectedEmpresas}
                    onSelectionChange={(e) => setSelectedEmpresas(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empresas"
                    globalFilter={globalFilter}
                    header={header}
                    responsiveLayout="scroll"
                >
                    <Column field="nombreComercial" header="Nombre Comercial" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="razonSocial" header="Razón Social" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="identificacion" header="RUC" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="telefono" header="Teléfono" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="correo" header="Correo" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog
                visible={empresaDialog}
                style={{ width: '750px' }}
                header="Detalles de la Empresa"
                modal
                className="p-fluid"
                footer={empresaDialogFooter}
                onHide={hideDialog}
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="nombreComercial">Nombre Comercial</label>
                            <InputText
                                id="nombreComercial"
                                value={empresa.nombreComercial}
                                onChange={(e) => onInputChange(e, 'nombreComercial')}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !empresa.nombreComercial })}
                            />
                            {submitted && !empresa.nombreComercial && <small className="p-error">El nombre comercial es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="razonSocial">Razón Social</label>
                            <InputText
                                id="razonSocial"
                                value={empresa.razonSocial}
                                onChange={(e) => onInputChange(e, 'razonSocial')}
                                required
                                className={classNames({ 'p-invalid': submitted && !empresa.razonSocial })}
                            />
                            {submitted && !empresa.razonSocial && <small className="p-error">La razón social es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="identificacion">RUC</label>
                            <InputText
                                id="identificacion"
                                value={empresa.identificacion}
                                onChange={(e) => onInputChange(e, 'identificacion')}
                                required
                                className={classNames({ 'p-invalid': submitted && !empresa.identificacion })}
                            />
                            {submitted && !empresa.identificacion && <small className="p-error">El RUC es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="tipoEmpresa">Tipo Empresa</label>
                            <Dropdown
                                id="tipoEmpresa"
                                value={empresa.idTipoEmpresa}
                                options={tiposEmpresa}
                                onChange={(e) => onInputChange(e, 'idTipoEmpresa')}
                                placeholder="Seleccione un tipo"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="provincia">Provincia</label>
                            <Dropdown
                                id="provincia"
                                value={empresa.idProvincia}
                                options={provincias}
                                onChange={(e) => onInputChange(e, 'idProvincia')}
                                placeholder="Seleccione una provincia"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="ciudad">Ciudad</label>
                            <Dropdown
                                id="ciudad"
                                value={empresa.idCiudad}
                                options={ciudades}
                                onChange={(e) => onInputChange(e, 'idCiudad')}
                                placeholder="Seleccione una ciudad"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="direccion">Dirección</label>
                            <InputText
                                id="direccion"
                                value={empresa.direccion}
                                onChange={(e) => onInputChange(e, 'direccion')}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText
                                id="telefono"
                                value={empresa.telefono}
                                onChange={(e) => onInputChange(e, 'telefono')}
                            />
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="correo">Correo</label>
                            <InputText
                                id="correo"
                                value={empresa.correo}
                                onChange={(e) => onInputChange(e, 'correo')}
                                required
                                className={classNames({ 'p-invalid': submitted && !empresa.correo })}
                            />
                            {submitted && !empresa.correo && <small className="p-error">El correo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="inicioActividad">Inicio Actividad</label>
                            <Calendar
                                id="inicioActividad"
                                value={empresa.inicioActividad ? new Date(empresa.inicioActividad) : null}
                                onChange={(e) => onDateChange(e, 'inicioActividad')}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="logo">Logo</label>
                            <div className="flex align-items-center">
                                <FileUpload
                                    ref={fileUploadRef}
                                    mode="basic"
                                    accept="image/*"
                                    maxFileSize={1000000}
                                    onSelect={onLogoSelect}
                                    auto
                                    chooseLabel="Seleccionar Logo"
                                />
                            </div>
                            {empresa.logoRuta && (
                                <div className="mt-2">
                                    <img src={empresa.logoRuta} alt="Logo" style={{ maxWidth: '200px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={deleteEmpresaDialog}
                style={{ width: '450px' }}
                header="Confirmar"
                modal
                footer={deleteEmpresaDialogFooter}
                onHide={hideDeleteEmpresaDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {empresa && <span>¿Está seguro de que desea eliminar la empresa <b>{empresa.nombreComercial}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Empresas;