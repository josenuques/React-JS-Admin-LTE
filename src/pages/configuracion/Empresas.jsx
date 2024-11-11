import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { UserContext } from '../../context/UserProvider';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { empresaModelo, ConsultarEmpresa, GuardarEmpresa } from '../../servicios/configuracion/Empresa';
import { ListarTiposEmpresa, ListarProvincias, ListarCiudades } from '../../servicios/general/General';

const Empresas = () => {
    const { user } = useContext(UserContext);
    const [empresas, setEmpresas] = useState([]);
    const [empresaDialog, setEmpresaDialog] = useState(false);
    const [deleteEmpresaDialog, setDeleteEmpresaDialog] = useState(false);
    const [empresa, setEmpresa] = useState(empresaModelo);
    const [selectedEmpresas, setSelectedEmpresas] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [tiposEmpresa, setTiposEmpresa] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const toast = useRef(null);
    const dt = useRef(null);
    const fileUploadRef = useRef(null);

    useEffect(() => {
        cargarEmpresas();
        cargarTiposEmpresa();
        cargarProvincias();
    }, []);

    useEffect(() => {
        if (empresa.idProvincia) {
            cargarCiudades(empresa.idProvincia);
        }
    }, [empresa.idProvincia]);

    const cargarEmpresas = async () => {
        try {
            if (user?.idempresa) {
                const data = await ConsultarEmpresa();
                setEmpresas(Array.isArray(data) ? data : [data]);
            }
        } catch (error) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Error al cargar empresas', 
                life: 3000 
            });
        }
    };

    const cargarTiposEmpresa = async () => {
        try {
            const data = await ListarTiposEmpresa();
            const tiposFormateados = data.map(tipo => ({
                label: tipo.descripcion,
                value: tipo.id
            }));
            setTiposEmpresa(tiposFormateados);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar tipos de empresa',
                life: 3000
            });
        }
    };

    const cargarProvincias = async () => {
        try {
            const data = await ListarProvincias();
            const provinciasFormateadas = data.map(provincia => ({
                label: provincia.nombre,
                value: provincia.id
            }));
            setProvincias(provinciasFormateadas);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar provincias',
                life: 3000
            });
        }
    };

    const cargarCiudades = async (idProvincia) => {
        try {
            const data = await ListarCiudades(idProvincia);
            const ciudadesFormateadas = data.map(ciudad => ({
                label: ciudad.ciudadtexto,
                value: ciudad.id
            }));
            setCiudades(ciudadesFormateadas);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar ciudades',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setEmpresa({
            ...empresaModelo,
            idempresa: user?.idempresa
        });
        setLogoFile(null);
        setCiudades([]);
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
            try {
                const response = await GuardarEmpresa(empresa, logoFile);
                if (response) {
                    toast.current.show({ 
                        severity: 'success', 
                        summary: 'Exitoso', 
                        detail: empresa.id ? 'Empresa actualizada' : 'Empresa creada', 
                        life: 3000 
                    });
                    await cargarEmpresas();
                    setEmpresaDialog(false);
                    setEmpresa(empresaModelo);
                }
            } catch (error) {
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Error al guardar la empresa', 
                    life: 3000 
                });
            }
        }
    };

    const editEmpresa = (empresa) => {
        setEmpresa({ ...empresa });
        if (empresa.idProvincia) {
            cargarCiudades(empresa.idProvincia);
        }
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
                                disabled={!empresa.idProvincia}
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