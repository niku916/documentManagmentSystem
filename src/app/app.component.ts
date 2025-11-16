import { Component } from '@angular/core';

type Subcategory = { cat_id: string; sub_cat_id: string; sub_cat_name: string };
type DocItem = {
  catId?: string;
  catName?: string;
  mandatory?: string;
  subcategoryMasterDataList?: Subcategory[];
  // UI state
  fileObj?: File | null;
  selectedSubCat?: string | null;
  uploadedFileName?: string | null;
  docUrl?: string | null;
  docUploaded?: boolean;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Simulated API response (use your JSON here)
  apiResponse: any = {
    responseType: 'Success',
    response: {
      statusCode: 'V001',
      uploadedList: [],
      nonUploadedList: [
        {
          catId: 'AP',
          catName: 'Address Proof',
          mandatory: 'Y',
          subcategoryMasterDataList: [
            { cat_id: 'AP', sub_cat_id: '103', sub_cat_name: 'Aadhaar Card' },
            { cat_id: 'AP', sub_cat_id: '1582', sub_cat_name: 'Bank Passbook Showing Address' },
            { cat_id: 'AP', sub_cat_id: '1101', sub_cat_name: 'Govt ID card' },
            { cat_id: 'AP', sub_cat_id: '1583', sub_cat_name: 'Indian Passport' },
            { cat_id: 'AP', sub_cat_id: '1089', sub_cat_name: 'Payslip by Central or State Government or Local Body' },
            { cat_id: 'AP', sub_cat_id: '105', sub_cat_name: 'Voter ID' }
          ]
        },
        {
          catId: 'IP',
          catName: 'Identity Proof',
          mandatory: 'Y',
          subcategoryMasterDataList: [
            { cat_id: 'IP', sub_cat_id: '103', sub_cat_name: 'Aadhaar Card' },
            { cat_id: 'IP', sub_cat_id: '1101', sub_cat_name: 'Govt ID card' },
            { cat_id: 'IP', sub_cat_id: '1583', sub_cat_name: 'Indian Passport' },
            { cat_id: 'IP', sub_cat_id: '151', sub_cat_name: 'PAN Card' },
            { cat_id: 'IP', sub_cat_id: '105', sub_cat_name: 'Voter ID' }
          ]
        },
        {
          catId: 'CP3',
          catName: 'Chassis Print',
          mandatory: 'N',
          subcategoryMasterDataList: [{ cat_id: 'CP3', sub_cat_id: '1000', sub_cat_name: 'Chassis Print' }]
        },
        {
          catId: 'F60',
          catName: 'Form 60',
          mandatory: 'N',
          subcategoryMasterDataList: [{ cat_id: 'F60', sub_cat_id: '1977', sub_cat_name: 'Working Certificate In Form 60 Or Official Identity Card' }]
        },
        {
          catId: 'VPHOTO',
          catName: 'Vehicle Photo',
          mandatory: 'N',
          subcategoryMasterDataList: [{ cat_id: 'VPHOTO', sub_cat_id: '2046', sub_cat_name: 'Vehicle Photograph' }]
        }
      ],
      mandatoryList: [
        // duplicating mandatoryList same as earlier JSON
        {
          catId: 'AP',
          catName: 'Address Proof',
          mandatory: 'Y',
          subcategoryMasterDataList: [
            { cat_id: 'AP', sub_cat_id: '103', sub_cat_name: 'Aadhaar Card' },
            { cat_id: 'AP', sub_cat_id: '1582', sub_cat_name: 'Bank Passbook Showing Address' },
            { cat_id: 'AP', sub_cat_id: '1101', sub_cat_name: 'Govt ID card' },
            { cat_id: 'AP', sub_cat_id: '1583', sub_cat_name: 'Indian Passport' },
            { cat_id: 'AP', sub_cat_id: '1089', sub_cat_name: 'Payslip by Central or State Government or Local Body' },
            { cat_id: 'AP', sub_cat_id: '105', sub_cat_name: 'Voter ID' }
          ]
        },
        {
          catId: 'IP',
          catName: 'Identity Proof',
          mandatory: 'Y',
          subcategoryMasterDataList: [
            { cat_id: 'IP', sub_cat_id: '103', sub_cat_name: 'Aadhaar Card' },
            { cat_id: 'IP', sub_cat_id: '1101', sub_cat_name: 'Govt ID card' },
            { cat_id: 'IP', sub_cat_id: '1583', sub_cat_name: 'Indian Passport' },
            { cat_id: 'IP', sub_cat_id: '151', sub_cat_name: 'PAN Card' },
            { cat_id: 'IP', sub_cat_id: '105', sub_cat_name: 'Voter ID' }
          ]
        }
      ],
      applno: 'OR251010V0272609',
      purposeName: '[Change of Address in RC]',
      status: null
    },
    responseCode: 'OK',
    isError: false
  };

  docs: DocItem[] = [];

  ngOnInit() {
    this.docs = this.mergeLists(this.apiResponse);
  }

  private mergeLists(resp: any): DocItem[] {
    const seen = new Set<string>();
    const arr: DocItem[] = [];
    const add = (item: any) => {
      const key = item.catId || item.cat_id || JSON.stringify(item);
      if (!seen.has(key)) {
        const copy: DocItem = {
          ...item,
          fileObj: null,
          selectedSubCat: item.subcategoryMasterDataList && item.subcategoryMasterDataList.length ? item.subcategoryMasterDataList[0].sub_cat_id : null,
          uploadedFileName: null,
          docUrl: item.docUrl || null,
          docUploaded: !!item.docUploaded
        };
        arr.push(copy);
        seen.add(key);
      }
    };
    const r = resp.response || {};
    (r.mandatoryList || []).forEach(add);
    (r.nonUploadedList || []).forEach(add);
    return arr;
  }

  onFileChange(event: Event, doc: DocItem) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      doc.fileObj = null;
      return;
    }
    doc.fileObj = input.files[0];
  }

  upload(doc: DocItem) {
    if (!doc.fileObj) {
      alert('Please select a file to upload for: ' + (doc.catName || doc.catId));
      return;
    }
    // simulate upload
    doc.uploadedFileName = doc.fileObj.name;
    doc.docUploaded = true;
    doc.docUrl = 'blob:' + Math.random().toString(36).slice(2, 9);
    alert('Uploaded: ' + doc.uploadedFileName + ' for ' + (doc.catName || doc.catId));
  }

  clear(doc: DocItem, inputEl?: HTMLInputElement) {
    doc.fileObj = null;
    doc.uploadedFileName = null;
    doc.docUploaded = false;
    doc.docUrl = null;
    if (inputEl) inputEl.value = '';
  }

  view(doc: DocItem) {
    if (doc.docUrl) {
      const w = window.open('', '_blank');
      w!.document.write(`<p style="font-family:system-ui;padding:20px">Viewing (simulated): <strong>${doc.uploadedFileName || doc.docUrl}</strong></p>`);
      w!.document.title = 'View Document';
    } else {
      alert('No document available to view for ' + (doc.catName || doc.catId));
    }
  }

  proceed() {
    const missing = this.docs.filter(d => d.mandatory === 'Y' && !d.docUploaded);
    if (missing.length) {
      const names = missing.map(m => m.catName || m.catId).join(', ');
      alert('Please upload mandatory documents: ' + names);
      return;
    }
    const uploaded = this.docs.filter(d => d.docUploaded).map(d => ({
      catId: d.catId,
      catName: d.catName,
      subCat: (d.subcategoryMasterDataList || []).find(s => s.sub_cat_id === d.selectedSubCat)?.sub_cat_name || '',
      fileName: d.uploadedFileName || '—'
    }));
    if (!uploaded.length) {
      alert('No documents uploaded yet.');
      return;
    }
    let msg = 'Uploaded documents summary:\n\n';
    uploaded.forEach(u => {
      msg += `• ${u.catName} (${u.catId}) — ${u.subCat || 'subcat N/A'} — ${u.fileName}\n`;
    });
    alert(msg);
    // In a real app: send uploaded data to backend here
  }

  resetAll() {
    if (!confirm('Reset all uploaded files and selections?')) return;
    this.docs.forEach(d => this.clear(d));
  }
}
