function exit(err){
	console.trace()
	console.log("========")
	console.log(err.stack)
	process.exit()
}

module.exports = { exit: exit }
