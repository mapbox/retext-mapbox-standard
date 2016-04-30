module.exports = {
    citizens: { replace: ['people, the public, users'] },
    'DC': { cased: true, replace: ['D.C.'] },
    'Executive Branch': { cased: true, replace: ['executive branch'] },
    'Federal Government': { cased: true, replace: ['federal government'] },
    illegals: { replace: ['undocumented immigrants'] },
    'illegal aliens': { replace: ['undocumented immigrants'] },
    shall: { replace: ['must', 'may', 'should'] }, // federal plain language guidelines
   	'U.S. Government': { cased: true, replace: ['U.S. government'] },
   	'US Government': { cased: true, replace: ['U.S. government'] },
   	'US government': { cased: true, replace: ['U.S. government'] },
   	'USA': { cased: true, replace: ['U.S.', 'United States'] },
};
