/**
 * INTERNAL API BRIDGE - TRƯỜNG TH&THCS HỢP THÀNH
 * Mục đích: Cầu nối giao tiếp (Fetch API) giữa giao diện Web App và Google Apps Script.
 * Hệ thống quản trị công văn và lịch công tác nội bộ.
 * Phiên bản: An toàn hóa định danh V3 & Tích hợp AI Đa luồng
 */

// THẦY HÃY THAY ĐƯỜNG LINK DƯỚI ĐÂY BẰNG LINK WEB APP (đuôi /exec) CỦA THẦY:
const GAS_URL = "https://script.google.com/macros/s/AKfycbxQNLrkoHnxF81IO_QmB7rcIdjQhavLWNG6fy3VngBeR_2xG8rHxJAlrJLcAs_szZO9/exec";

// Khởi tạo luồng xử lý độc lập cho từng yêu cầu giao tiếp an toàn
function createRunner(onSuccess, onFailure) {
    return {
        withSuccessHandler: function(cb) {
            return createRunner(cb, onFailure);
        },
        withFailureHandler: function(cb) {
            return createRunner(onSuccess, cb);
        },
        _call: function(funcName, args) {
            // Đính kèm Token/Định danh người dùng hiện tại để Google Apps Script xác thực quyền hạn
            const sysId = window.SCV_GLOBAL_ID || sessionStorage.getItem("SCV_ACTIVE_ID");
            args.push(sysId); 

            fetch(GAS_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ func: funcName, args: args })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    if (onSuccess) onSuccess(res.data);
                } else {
                    if (onFailure) onFailure(res.error);
                    else console.error("Lỗi từ máy chủ Google:", res.error);
                }
            })
            .catch(err => {
                if (onFailure) onFailure(err);
                else console.error("Lỗi mất kết nối:", err);
            });
        },
        // Danh sách các API tiêu chuẩn được phép gọi (Đồng bộ với whitelist trên GAS)
        SCV_getInitialData: function() { this._call('SCV_getInitialData', []); },
        SCV_saveDataLich: function(a) { this._call('SCV_saveDataLich', [a]); },
        SCV_getDataLich: function(a) { this._call('SCV_getDataLich', [a]); },
        SCV_deleteLich: function(a,b) { this._call('SCV_deleteLich', [a,b]); }, 
        SCV_getDmCongVan: function() { this._call('SCV_getDmCongVan', []); },
        SCV_saveCongVan: function(a,b) { this._call('SCV_saveCongVan', [a,b]); },
        SCV_getDataCongVan: function(a) { this._call('SCV_getDataCongVan', [a]); },
        SCV_deleteCongVan: function(a,b) { this._call('SCV_deleteCongVan', [a,b]); }, 
        SCV_getSubFolders: function(a) { this._call('SCV_getSubFolders', [a]); },
        SCV_createNewFolder: function(a,b) { this._call('SCV_createNewFolder', [a,b]); },
        SCV_uploadMultipleFilesToDrive: function(a,b,c,d,e) { this._call('SCV_uploadMultipleFilesToDrive', [a,b,c,d,e]); },
        SCV_uploadFolderEvidence: function(a,b,c,d,e) { this._call('SCV_uploadFolderEvidence', [a,b,c,d,e]); },
        // Lệnh dọn dẹp file Drive rác
        SCV_deleteFileByUrl: function(a) { this._call('SCV_deleteFileByUrl', [a]); },
        // KẾT NỐI CHUYÊN TRÁCH GIAO TIẾP VỚI TRỢ LÝ AI
        SCV_chatWithDocument: function(a,b) { this._call('SCV_chatWithDocument', [a,b]); },
        SCV_extractLichFromDocument: function(a,b) { this._call('SCV_extractLichFromDocument', [a,b]); },
        SCV_extractCongVanFromDocument: function(a,b) { this._call('SCV_extractCongVanFromDocument', [a,b]); }
    };
}

// Bắt buộc tạo mới Runner mỗi khi gọi google.script.run để tránh nghẽn luồng
const google = {
    script: {
        get run() {
            return createRunner(null, null);
        }
    }
};
