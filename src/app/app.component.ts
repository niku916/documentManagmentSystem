import { Component } from '@angular/core';
import { UploadService } from './upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  step = 1;
  loading = false;
  progress = 0;

  // Put your API JSON exactly here (I used the JSON you shared earlier)
  apiResponse: any = {
    "responseType":"Success",
    "response":{
      "documentList":null,
      "allDocumentList":null,
      "offCode":null,
      "statusCode":"V001",
      "jsecurityKey":null,
      "jkey":null,
      "uploadedList":[],
      "nonUploadedList":[
        {"catId":"AP","catName":"Address Proof","mandatory":"Y","docUploaded":false,
          "subcategoryMasterDataList":[
            {"cat_id":"AP","sub_cat_id":"103","sub_cat_name":"Aadhaar Card"},
            {"cat_id":"AP","sub_cat_id":"1582","sub_cat_name":"Bank Passbook Showing Address"},
            {"cat_id":"AP","sub_cat_id":"1101","sub_cat_name":"Govt ID card"},
            {"cat_id":"AP","sub_cat_id":"1583","sub_cat_name":"Indian Passport"},
            {"cat_id":"AP","sub_cat_id":"1089","sub_cat_name":"Payslip by Central or State Government or Local Body"},
            {"cat_id":"AP","sub_cat_id":"105","sub_cat_name":"Voter ID"}
          ]
        },
        {"catId":"IP","catName":"Identity Proof","mandatory":"Y","docUploaded":false,
          "subcategoryMasterDataList":[
            {"cat_id":"IP","sub_cat_id":"103","sub_cat_name":"Aadhaar Card"},
            {"cat_id":"IP","sub_cat_id":"1101","sub_cat_name":"Govt ID card"},
            {"cat_id":"IP","sub_cat_id":"1583","sub_cat_name":"Indian Passport"},
            {"cat_id":"IP","sub_cat_id":"151","sub_cat_name":"PAN Card "},
            {"cat_id":"IP","sub_cat_id":"105","sub_cat_name":"Voter ID"}
          ]
        },
        {"catId":"CP3","catName":"Chassis Print","mandatory":"N","docUploaded":false,
          "subcategoryMasterDataList":[{"cat_id":"CP3","sub_cat_id":"1000","sub_cat_name":"Chassis Print"}]
        },
        {"catId":"F60","catName":"Form 60","mandatory":"N","docUploaded":false,
          "subcategoryMasterDataList":[{"cat_id":"F60","sub_cat_id":"1977","sub_cat_name":"Working Certificate In Form 60 Or Official Identity Card"}]
        },
        {"catId":"VPHOTO","catName":"Vehicle Photo","mandatory":"N","docUploaded":false,
          "subcategoryMasterDataList":[{"cat_id":"VPHOTO","sub_cat_id":"2046","sub_cat_name":"Vehicle Photograph"}]
        }
      ],
      "mandatoryList":[
        {"catId":"AP","catName":"Address Proof","mandatory":"Y","docUploaded":false,
          "subcategoryMasterDataList":[
            {"cat_id":"AP","sub_cat_id":"103","sub_cat_name":"Aadhaar Card"},
            {"cat_id":"AP","sub_cat_id":"1582","sub_cat_name":"Bank Passbook Showing Address"},
            {"cat_id":"AP","sub_cat_id":"1101","sub_cat_name":"Govt ID card"},
            {"cat_id":"AP","sub_cat_id":"1583","sub_cat_name":"Indian Passport"},
            {"cat_id":"AP","sub_cat_id":"1089","sub_cat_name":"Payslip by Central or State Government or Local Body"},
            {"cat_id":"AP","sub_cat_id":"105","sub_cat_name":"Voter ID"}
          ]
        },
        {"catId":"IP","catName":"Identity Proof","mandatory":"Y","docUploaded":false,
          "subcategoryMasterDataList":[
            {"cat_id":"IP","sub_cat_id":"103","sub_cat_name":"Aadhaar Card"},
            {"cat_id":"IP","sub_cat_id":"1101","sub_cat_name":"Govt ID card"},
            {"cat_id":"IP","sub_cat_id":"1583","sub_cat_name":"Indian Passport"},
            {"cat_id":"IP","sub_cat_id":"151","sub_cat_name":"PAN Card "},
            {"cat_id":"IP","sub_cat_id":"105","sub_cat_name":"Voter ID"}
          ]
        }
      ],
      "applno":"OR251010V0272609",
      "purposeName":"[Change of Address in RC]",
      "status":null
    },
    "responseCode":"OK",
    "isError":false
  };

  docs: any[] = [];

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.docs = this.mergeLists(this.apiResponse);
  }

  private mergeLists(resp: any) {
    const seen = new Set<string>();
    const arr: any[] = [];
    const add = (item: any) => {
      const key = item.catId || item.cat_id || JSON.stringify(item);
      if (!seen.has(key)) {
        arr.push({
          ...item,
          fileObj: null,
          selectedSubCat: item.subcategoryMasterDataList?.[0]?.sub_cat_id || null,
          uploadedFileName: null,
          docUrl: item.docUrl || null,
          docUploaded: !!item.docUploaded
        });
        seen.add(key);
      }
    };
    (resp.response.mandatoryList || []).forEach(add);
    (resp.response.nonUploadedList || []).forEach(add);
    return arr;
  }

  onFileSelected(event: Event, doc: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) doc.fileObj = input.files[0];
  }

  chooseFile(doc: any, inputEl: HTMLInputElement) {
    inputEl.click();
  }

  upload(doc: any) {
    if (!doc.fileObj) {
      alert('Select a file first for ' + doc.catName);
      return;
    }
    this.loading = true;
    this.progress = 0;
    this.uploadService.uploadFile(doc.fileObj, { catId: doc.catId, subCatId: doc.selectedSubCat, applNo: this.apiResponse.response.applno })
      .subscribe((evt: any) => {
        if (evt.type === 'progress') {
          this.progress = evt.percent;
        } else if (evt.type === 'response') {
          this.loading = false;
          doc.docUploaded = true;
          doc.uploadedFileName = doc.fileObj.name;
          doc.docUrl = evt.body?.docUrl || evt.body?.path || 'uploaded://' + doc.uploadedFileName;
          alert('Upload successful: ' + doc.uploadedFileName);
        }
      }, (err: any) => {
        this.loading = false;
        alert('Upload failed: ' + (err.message || err.statusText || 'server error'));
      });
  }

  clear(doc: any, fileInput?: HTMLInputElement) {
    doc.fileObj = null;
    doc.uploadedFileName = null;
    doc.docUploaded = false;
    doc.docUrl = null;
    if (fileInput) fileInput.value = '';
  }

  view(doc: any) {
    if (doc.docUrl) {
      const w = window.open('', '_blank');
      w!.document.write(`<p style="font-family:system-ui;padding:20px">Viewing: <strong>${doc.uploadedFileName || doc.docUrl}</strong></p>`);
      return;
    }
    alert('No document to view');
  }

  proceed() {
    const missing = this.docs.filter(d => d.mandatory === 'Y' && !d.docUploaded);
    if (missing.length) {
      alert('Please upload mandatory docs: ' + missing.map(m => m.catName || m.catId).join(', '));
      return;
    }
    this.step = 2;
  }

  submitAll() {
    alert('All documents submitted. (Simulation)');
  }
}
